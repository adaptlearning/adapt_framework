const CacheManager = require('../helpers/CacheManager');

module.exports = function(grunt) {

  const convertSlashes = /\\/g;

  function escapeRegExp(string) {
    return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  }

  const path = require('path');
  const fs = require('fs-extra');
  const rollup = require('rollup');
  const { babel } = require('@rollup/plugin-babel');
  const terser = require('@rollup/plugin-terser');
  const { deflate, unzip, constants } = require('zlib');

  const cwd = process.cwd().replace(convertSlashes, '/') + '/';
  const isDisableCache = process.argv.includes('--disable-cache');
  let cache;

  const extensions = ['.js', '.jsx'];
  const cacheManager = new CacheManager(grunt, grunt.config('cacheAge'));

  const restoreCache = async (cachePath, basePath) => {
    if (isDisableCache || cache || !fs.existsSync(cachePath)) return;
    await new Promise((resolve, reject) => {
      const buffer = fs.readFileSync(cachePath);
      unzip(buffer, (err, buffer) => {
        if (err) {
          console.error('An error occurred restoring rollup cache:', err);
          process.exitCode = 1;
          reject(err);
          return;
        }
        let str = buffer.toString();
        // Restore cache to current basePath
        str = str.replace(/%%basePath%%/g, basePath);
        cache = JSON.parse(str);
        resolve();
      });
    });
  };

  const checkCache = function(invalidate) {
    if (!cache) return;
    const idHash = {};
    const missing = {};
    cache.modules.forEach(mod => {
      const moduleId = mod.id;
      const isRollupHelper = (moduleId[0] === '\u0000');
      if (isRollupHelper) {
        // Ignore as injected rollup module
        return null;
      }
      if (!fs.existsSync(moduleId)) {
        grunt.log.error(`Cache missing file: ${moduleId.replace(cwd, '')}`);
        missing[moduleId] = true;
        return false;
      }
      if (invalidate && invalidate.includes(moduleId)) {
        grunt.log.ok(`Cache skipping file: ${moduleId.replace(cwd, '')}`);
        return false;
      }
      idHash[moduleId] = mod;
      return true;
    });
    if (Object.keys(missing).length) {
      cache = null;
      return;
    }
    cache.modules = Object.values(idHash);
  };

  const saveCache = async (cachePath, basePath, bundleCache) => {
    if (!isDisableCache) {
      cache = bundleCache;
    }
    await new Promise((resolve, reject) => {
      let str = JSON.stringify(bundleCache);
      // Make cache location agnostic by stripping current basePath
      str = str.replace(new RegExp(escapeRegExp(basePath), 'g'), '%%basePath%%');
      deflate(str, { level: constants.Z_BEST_SPEED }, (err, buffer) => {
        if (err) {
          console.error('An error occurred saving rollup cache:', err);
          process.exitCode = 1;
          reject(err);
          return;
        }
        fs.writeFileSync(cachePath, buffer);
        resolve();
      });
    });
  };

  const logPrettyError = (err, cachePath, basePath) => {
    let hasOutput = false;
    if (err.loc) {
      // Code error
      switch (err.plugin) {
        case 'babel':
          err.frame = err.message.substr(err.message.indexOf('\n') + 1);
          err.message = err.message.substr(0, err.message.indexOf('\n')).slice(2).replace(/^([^:]*): /, '');
          break;
        default:
          hasOutput = true;
          console.error(err.toString());
      }
      if (!hasOutput) {
        console.error(err.toString());
        console.error(`Line: ${err.loc.line}, Col: ${err.loc.column}, File: ${err.id.replace(cwd, '')}`);
        console.error(err.frame);
        hasOutput = true;
      }
    }
    if (!hasOutput) {
      cache = null;
      saveCache(cachePath, basePath, cache);
      console.error(err.toString());
    }
  };

  grunt.registerMultiTask('javascript', 'Compile JavaScript files', async function() {
    const Helpers = require('../helpers')(grunt);
    const buildConfig = Helpers.generateConfigData();
    const isStrictMode = buildConfig.strictMode;
    grunt.log.ok(`Strict mode (config.json:build.strictMode): ${isStrictMode}`);
    grunt.log.ok(`Cache disabled (--disable-cache): ${isDisableCache}`);
    const done = this.async();
    const options = this.options({});
    const isSourceMapped = Boolean(options.generateSourceMaps);
    const basePath = path.resolve(cwd + '/' + options.baseUrl).replace(convertSlashes, '/') + '/';
    const cachePath = cacheManager.cachePath(cwd, options.out);
    if (!isDisableCache) {
      grunt.log.ok(`Cache path: ${cachePath}`);
    }
    try {
      await restoreCache(cachePath, basePath);
      await cacheManager.clean();
      const pluginsPath = path.resolve(cwd, options.pluginsPath).replace(convertSlashes, '/');

      // Make src/plugins.js to attach the plugins dynamically
      if (!fs.existsSync(pluginsPath)) {
        fs.writeFileSync(pluginsPath, '');
      }

      // Collect all plugin entry points for injection
      const pluginPaths = [];
      for (let i = 0, l = options.plugins.length; i < l; i++) {
        const src = options.plugins[i];
        grunt.file.expand({
          filter: options.pluginsFilter
        }, src).forEach(function(bowerJSONPath) {
          if (bowerJSONPath === undefined) return;
          const pluginPath = path.dirname(bowerJSONPath);
          const bowerJSON = grunt.file.readJSON(bowerJSONPath);
          const requireJSRootPath = pluginPath.substr(options.baseUrl.length);
          const requireJSMainPath = path.join(requireJSRootPath, bowerJSON.main);
          const ext = path.extname(requireJSMainPath);
          const requireJSMainPathNoExt = requireJSMainPath.slice(0, -ext.length).replace(convertSlashes, '/');
          pluginPaths.push(requireJSMainPathNoExt);
        });
      }

      // Collect react templates
      const reactTemplatePaths = [];
      options.reactTemplates.forEach(pattern => {
        grunt.file.expand({
          filter: options.pluginsFilter
        }, pattern).forEach(templatePath => reactTemplatePaths.push(templatePath.replace(convertSlashes, '/')));
      });

      // Process remapping and external model configurations
      const mapParts = Object.keys(options.map);
      const externalParts = Object.keys(options.external);
      const externalMap = options.externalMap;

      const findFile = function(filename) {
        filename = filename.replace(convertSlashes, '/');
        const hasValidExtension = extensions.includes(path.parse(filename).ext);
        if (!hasValidExtension) {
          const ext = extensions.find(ext => fs.existsSync(filename + ext)) || '';
          filename += ext;
        }
        return filename;
      };

      const umdImports = options.umdImports.map(filename => findFile(path.resolve(basePath, filename)));

      // Rework modules names and inject plugins
      const adaptLoader = function() {
        return {

          name: 'adaptLoader',

          resolveId(moduleId, parentId) {
            const isRollupHelper = (moduleId[0] === '\u0000');
            if (isRollupHelper) {
              // Ignore as injected rollup module
              return null;
            }
            const mapPart = mapParts.find(part => moduleId.startsWith(part));
            if (mapPart) {
              // Remap module, usually coreJS/adapt to core/js/adapt etc
              moduleId = moduleId.replace(mapPart, options.map[mapPart]);
            }
            // Remap ../libraries/ or core/js/libraries/ to libraries/
            moduleId = Object.entries(externalMap).reduce((moduleId, [ match, replaceWith ]) => moduleId.replace((new RegExp(match, 'g')), replaceWith), moduleId);
            const isRelative = (moduleId[0] === '.');
            if (isRelative) {
              if (!parentId) {
                // Rework app.js path so that it can be made basePath agnostic in the cache
                const filename = findFile(path.resolve(moduleId));
                return {
                  id: filename,
                  external: false
                };
              }
              // Rework relative paths into absolute ones
              const filename = findFile(path.resolve(parentId + '/../' + moduleId));
              return {
                id: filename,
                external: false
              };
            }
            const externalPart = externalParts.find(part => moduleId.startsWith(part));
            const isEmpty = (options.external[externalPart] === 'empty:');
            if (isEmpty) {
              // External module as is defined as 'empty:', libraries/ bower handlebars etc
              return {
                id: moduleId,
                external: true
              };
            }
            const isES6Import = !fs.existsSync(moduleId);
            if (isES6Import) {
              // ES6 imports start inside ./src so need correcting
              const filename = findFile(path.resolve(cwd, options.baseUrl, moduleId));
              return {
                id: filename,
                external: false
              };
            }
            // Normalize all other absolute paths as conflicting slashes will load twice
            const filename = findFile(path.resolve(cwd, moduleId));
            return {
              id: filename,
              external: false
            };
          }

        };
      };

      const adaptInjectPlugins = function() {
        return {

          name: 'adaptInjectPlugins',

          transform(code, moduleId) {
            const isRollupHelper = (moduleId[0] === '\u0000');
            if (isRollupHelper) {
              return null;
            }
            const isPlugins = (moduleId.includes('/' + options.pluginsModule + '.js'));
            if (!isPlugins) {
              return null;
            }
            // Dynamically construct plugins.js with plugin dependencies
            code = `define([${pluginPaths.map(filename => {
              return `"${filename}"`;
            }).concat(reactTemplatePaths.map(filename => {
              return `"${filename}"`;
            })).join(',')}], function() {});`;
            return code;
          }

        };
      };

      const targets = buildConfig.targets || null;
      const browserList = fs.existsSync('.browserslistrc')
        ? fs.readFileSync('.browserslistrc')
          .toString()
          .replace(/#+[^\n]+\n/gm, '')
          .replace(/\r/g, '')
          .split('\n')
          .filter(Boolean)
          .join(', ')
        : [
          'last 2 chrome versions, last 2 firefox versions',
          'last 2 safari versions',
          'last 2 edge versions',
          'last 2 ios_saf versions',
          'last 2 and_chr versions',
          'firefox esr'
        ].join(', ');
      grunt.log.ok(`Targets: ${targets || browserList}`);

      const inputOptions = {
        input: './' + options.baseUrl + options.name,
        shimMissingExports: true,
        plugins: [
          adaptLoader({}),
          adaptInjectPlugins({}),
          babel({
            babelHelpers: 'bundled',
            extensions,
            minified: false,
            compact: false,
            comments: false,
            exclude: [
              '**/node_modules/**'
            ],
            presets: [
              [
                '@babel/preset-react',
                {
                  runtime: 'classic'
                }
              ],
              [
                '@babel/preset-env',
                {
                  useBuiltIns: 'entry',
                  corejs: 3,
                  exclude: [
                    // Breaks lockingModel.js, set function vs set variable
                    'transform-function-name'
                  ],
                  targets
                }
              ]
            ],
            plugins: [
              [
                'transform-amd-to-es6',
                {
                  umdToAMDModules: true,
                  amdToES6Modules: true,
                  amdDefineES6Modules: true,
                  ignoreNestedRequires: true,
                  defineFunctionName: '__AMD',
                  defineModuleId: (moduleId) => moduleId.replace(convertSlashes, '/').replace(basePath, '').replace('.js', ''),
                  excludes: [
                    '**/templates/**/*.jsx'
                  ]
                }
              ],
              [
                'transform-react-templates',
                {
                  includes: [
                    '**/templates/**/*.jsx'
                  ],
                  importRegisterFunctionFromModule: path.resolve(basePath, 'core/js/reactHelpers.js').replace(convertSlashes, '/'),
                  registerFunctionName: 'register',
                  registerTemplateName: (moduleId) => path.parse(moduleId).name
                }
              ]
            ]
          })
        ]
      };

      const umdImport = () => {
        return umdImports.map(filename => {
          let code = fs.readFileSync(filename).toString();
          code = code
            .replace('require("object-assign")', 'Object.assign')
            .replace('define.amd', 'define.noop');
          return code;
        }).join('\n');
      };

      const outputOptions = {
        file: options.out,
        format: 'amd',
        plugins: [
          !isSourceMapped && terser({
            mangle: false,
            compress: false
          })
        ].filter(Boolean),
        intro: umdImport(),
        footer: `// Allow ES export default to be exported as amd modules
window.__AMD = function(id, value) {
  window.define(id, function() { return value; }); // define for external use
  window.require([id]); // force module to load
  return value; // return for export
};`,
        sourcemap: isSourceMapped,
        sourcemapPathTransform: (relativeSourcePath) => {
          // Rework sourcemap paths to overlay at the appropriate root
          return relativeSourcePath.replace(convertSlashes, '/').replace('../' + options.baseUrl, '');
        },
        amd: {
          define: 'require'
        },
        strict: isStrictMode
      };

      checkCache([pluginsPath]);
      inputOptions.cache = cache;
      const bundle = await rollup.rollup(inputOptions);
      await saveCache(cachePath, basePath, bundle.cache);
      await bundle.write(outputOptions);

      // Remove old sourcemap if no longer required
      if (!isSourceMapped && fs.existsSync(options.out + '.map')) {
        fs.unlinkSync(options.out + '.map');
      }

      done();
    } catch (err) {
      try {
        await fs.unlink(cachePath);
      } catch (err) {}
      logPrettyError(err, cachePath, basePath);
      done(false);
    }
  });
};
