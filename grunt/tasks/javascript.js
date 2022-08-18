module.exports = function(grunt) {

  const convertSlashes = /\\/g;

  function escapeRegExp(string) {
    return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  }

  const path = require('path');
  const fs = require('fs-extra');
  const rollup = require('rollup');
  const { babel, getBabelOutputPlugin } = require('@rollup/plugin-babel');
  const { nodeResolve } = require('@rollup/plugin-node-resolve');
  const commonjs = require('@rollup/plugin-commonjs');
  const replace = require('@rollup/plugin-replace');
  const { terser } = require('rollup-plugin-terser');

  const resolve = require('resolve');
  const { deflate, unzip, constants } = require('zlib');
  const MagicString = require('magic-string');

  const cwd = process.cwd().replace(convertSlashes, '/') + '/';
  const isDisableCache = process.argv.includes('--disable-cache');
  let cache;

  const extensions = ['.js', '.jsx'];

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
      deflate(str, { level: constants.Z_BEST_COMPRESSION }, (err, buffer) => {
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
    grunt.log.ok(`Cache disabled (--disable-cache): ${isDisableCache}`);
    grunt.log.ok(`Strict mode (config.json:build.strictMode): ${isStrictMode}`);
    const done = this.async();
    const options = this.options({});
    const cachePath = buildConfig.cachepath ?? options.cachePath;
    const isSourceMapped = Boolean(options.generateSourceMaps);
    const basePath = path.resolve(cwd + '/' + options.baseUrl).replace(convertSlashes, '/') + '/';

    const framework = Helpers.getFramework();
    const pluginsObject = framework.getPlugins();
    const corePlugin = pluginsObject.plugins.find(plugin => plugin.type === 'core');

    try {
      await restoreCache(cachePath, basePath);

      // Collect all plugin entry points for injection
      const pluginPaths = pluginsObject.plugins.map(plugin => {
        if (plugin.name === corePlugin.name) return null;
        const requireJSRootPath = plugin.sourcePath.substr(options.baseUrl.length);
        const requireJSMainPath = path.join(requireJSRootPath, plugin.main);
        const ext = path.extname(requireJSMainPath);
        const requireJSMainPathNoExt = requireJSMainPath.slice(0, -ext.length).replace(convertSlashes, '/');
        return requireJSMainPathNoExt;
      }).filter(Boolean);

      // Collect react templates
      const reactTemplatePaths = [];
      options.reactTemplates.forEach(pattern => {
        grunt.file.expand({
          filter: options.pluginsFilter
        }, pattern).forEach(templatePath => {
          const requireJSRootPath = templatePath.substr(options.baseUrl.length);
          return reactTemplatePaths.push(requireJSRootPath.replace(convertSlashes, '/'));
        });
      });

      // Process remapping and external model configurations
      const pluginMap = pluginsObject.plugins.reduce((map, plugin) => ({ ...map, ...plugin.compilationMap }), {});
      const pluginExternals = pluginsObject.plugins.reduce((paths, plugin) => ({ ...paths, ...plugin.externalPaths }), {});
      const pluginRedirects = pluginsObject.plugins.reduce((redirects, plugin) => ({ ...redirects, ...plugin.runtimeRedirects }), {});
      const maps = { ...options.map, ...pluginMap };
      const externals = { ...options.external, ...pluginExternals };
      const backwardCompatibleRedirects = pluginsObject.plugins.reduce((redirects, plugin) => {
        const part = `${plugin.name}/`;
        redirects[part] = redirects[part] || [];
        if (plugin.type === 'core') {
          redirects[part].push('core/');
          return redirects;
        }
        redirects[part].push(`${plugin.legacyFolder}/${plugin.name}/`);
        return redirects;
      }, pluginRedirects);
      const mapped = {};
      const mapParts = Object.keys(maps).sort((a, b) => b.localeCompare(a));
      const externalParts = Object.keys(externals);
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
            if (moduleId.startsWith(basePath)) {
              moduleId = moduleId.substr(basePath.length);
            }
            const mapPart = mapParts.find(part => moduleId.startsWith(part));
            if (mapPart) {
              // Remap module, usually coreJS/adapt to core/js/adapt etc
              const original = moduleId;
              moduleId = moduleId.replace(mapPart, maps[mapPart]);
              mapped[moduleId] = original;
            }
            // Remap ../libraries/ or core/js/libraries/ to libraries/
            moduleId = Object.entries(externalMap).reduce((moduleId, [ match, replaceWith ]) => moduleId.replace((new RegExp(match, 'g')), replaceWith), moduleId);

            const externalPart = externalParts.find(part => moduleId.startsWith(part));
            const isEmpty = Boolean(options.external[externalPart]);
            if (isEmpty) {
              // External module as is defined as 'empty:', libraries/ bower handlebars etc
              return {
                id: moduleId,
                external: true
              };
            }
            try {
              // TODO: Cache resolved external modules
              if (!moduleId.includes('adapt-') && resolve.sync(moduleId, { basedir: path.resolve(cwd, options.baseUrl) })) {
                return null;
              }
            } catch (err) {}

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
            const isStart = (moduleId.includes('/' + options.baseUrl + corePlugin.name + corePlugin.main));
            if (!isStart) {
              return null;
            }

            const magicString = new MagicString(code);

            const matches = [...String(code).matchAll(/import .*;/g)];
            const last = matches[matches.length - 1];
            const end = last.index + last[0].length;

            const headerPart = `\n${Object.keys(pluginExternals).map(filename => {
              return `import '${filename}';\n`;
            }).join('')}`;
            const original = code.substr(0, end);
            const newPart = `\n${pluginPaths.map(filename => {
              return `import '${filename}';\n`;
            }).concat(reactTemplatePaths.map(filename => {
              return `import '${filename}';\n`;
            })).join('')}`;

            magicString.remove(0, end);
            magicString.prepend(headerPart + original + newPart);

            return {
              code: magicString.toString(),
              map: isSourceMapped
                ? magicString.generateMap({
                  filename: moduleId,
                  includeContent: true
                })
                : false
            };
          }

        };
      };

      const targets = buildConfig.targets || null;
      grunt.log.ok(`Targets: ${targets || fs.readFileSync('.browserslistrc').toString().replace(/#+[^\n]+\n/gm, '').replace(/\r/g, '').split('\n').filter(Boolean).join(', ')}`);

      const inputOptions = {
        input: './' + options.baseUrl + corePlugin.name + corePlugin.main,
        shimMissingExports: true,
        external: externalParts,
        treeshake: false,
        plugins: [
          adaptLoader({}),
          adaptInjectPlugins({}),
          replace({
            'process.env.NODE_ENV': isSourceMapped ? JSON.stringify('development') : JSON.stringify('production'),
            preventAssignment: true
          }),
          commonjs({
            exclude: ['**/node_modules/adapt-*/**'],
            sourceMap: isSourceMapped
          }),
          !isSourceMapped && terser(),
          nodeResolve({
            browser: true,
            preferBuiltins: false
          }),
          babel({
            babelHelpers: 'bundled',
            extensions,
            minified: false,
            compact: false,
            comments: false,
            exclude: [ '**/node_modules/core-js/**' ],
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
                  useBuiltIns: 'usage',
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
                  includes: [
                    '**/node_modules/adapt-*/**'
                  ],
                  excludes: [
                    '**/node_modules/adapt-*/templates/**/*.jsx'
                  ]
                }
              ],
              [
                'transform-react-templates',
                {
                  includes: [
                    '**/node_modules/adapt-*/templates/**/*.jsx'
                  ],
                  importRegisterFunctionFromModule: path.resolve(basePath, 'core/js/reactHelpers.js').replace(convertSlashes, '/'),
                  registerFunctionName: 'register',
                  registerTemplateName: (moduleId) => path.parse(moduleId).name
                }
              ]
            ]
          })
        ].filter(Boolean)
      };

      checkCache([]);
      inputOptions.cache = cache;
      const bundle = await rollup.rollup(inputOptions);
      await saveCache(cachePath, basePath, bundle.cache);

      const outputOptions = {
        file: options.out,
        format: 'amd',
        interop: false,
        plugins: [
          !isSourceMapped && getBabelOutputPlugin({
            minified: true,
            compact: true,
            comments: false,
            allowAllFormats: true
          })
        ].filter(Boolean),
        banner: `(function() {
// This section is for legacy requirejs support
var compilationMap = ${JSON.stringify(mapped, null, 2)};
var externalPaths = ${JSON.stringify(pluginExternals, null, 2)};
requirejs.config({
  paths: externalPaths
});
var runtimeRedirects = ${JSON.stringify(backwardCompatibleRedirects, null, 2)};
var runtimeRedirectParts = Object.keys(runtimeRedirects);
window.__AMD = function(defineId, value) {
  function register(id) {
    window.define(id, function() { return value; });
    window.require([id]);
  }
  var compilationId = compilationMap[defineId];
  if (compilationId) register(compilationId)
  var redirectPart;
  for (var i = 0, l = runtimeRedirectParts.length; i < l; i++) {
    var part = runtimeRedirectParts[i];
    if (defineId.substr(0, part.length) !== part) continue;
    redirectPart = part;
    break;
  }
  if (redirectPart) {
    var runtimePartRedirects = runtimeRedirects[redirectPart];
    for (var i = 0, l = runtimePartRedirects.length; i < l; i++) {
      var runtimeRedirectPart = runtimePartRedirects[i];
      var redirectId = defineId.replace(redirectPart, runtimeRedirectPart);
      register(redirectId);
    }
  }
  register(defineId)
  return value;
};
})();`,
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

      await bundle.write(outputOptions);

      // Remove old sourcemap if no longer required
      if (!isSourceMapped && fs.existsSync(options.out + '.map')) {
        fs.unlinkSync(options.out + '.map');
      }

      done();
    } catch (err) {
      logPrettyError(err, cachePath, basePath);
      done(false);
    }
  });
};
