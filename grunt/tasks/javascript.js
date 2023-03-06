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
  const { nodeResolve } = require('@rollup/plugin-node-resolve');
  const commonjs = require('@rollup/plugin-commonjs');
  const replace = require('@rollup/plugin-replace');
  const terser = require('@rollup/plugin-terser');
  const resolve = require('resolve');
  const MagicString = require('magic-string');
  const { deflate, unzip, constants } = require('zlib');

  const cwd = process.cwd().replace(convertSlashes, '/') + '/';
  const isDisableCache = process.argv.includes('--disable-cache');
  let cache;

  const extensions = ['.js', '.jsx'];
  const cacheManager = new CacheManager(grunt);

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

  const resolvedNodeModules = {};
  const findNodeModule = (cwd, baseUrl, moduleId) => {
    if (resolvedNodeModules[moduleId]) return resolvedNodeModules[moduleId];
    resolvedNodeModules[moduleId] = resolve.sync(moduleId, { basedir: path.resolve(cwd, baseUrl) });
    return resolvedNodeModules[moduleId];
  };

  grunt.registerMultiTask('javascript', 'Compile JavaScript files', async function() {
    const Helpers = require('../helpers')(grunt);
    const buildConfig = Helpers.generateConfigData();
    const isStrictMode = buildConfig.strictMode;
    grunt.log.ok(`Cache disabled (--disable-cache): ${isDisableCache}`);
    grunt.log.ok(`Strict mode (config.json:build.strictMode): ${isStrictMode}`);
    const done = this.async();
    const options = this.options({});
    const isSourceMapped = Boolean(options.generateSourceMaps);
    const basePath = path.resolve(cwd + '/' + options.baseUrl).replace(convertSlashes, '/') + '/';
    const cachePath = buildConfig.cachepath ?? cacheManager.cachePath(cwd, options.out);

    const framework = Helpers.getFramework();
    const pluginsObject = framework.getPlugins();
    const pluginPackageJSONs = pluginsObject.getAllPackageJSONFileItems().map(item => item.item);
    const pluginMappings = pluginPackageJSONs.reduce((mappings, packageJSON) => {
      if (!packageJSON.adapt_framework) return mappings;
      mappings.map = Object.assign({}, mappings.map, packageJSON.adapt_framework.map);
      mappings.paths = Object.assign({}, mappings.paths, packageJSON.adapt_framework.paths);
      return mappings;
    }, {});

    try {
      await restoreCache(cachePath, basePath);
      await cacheManager.clean();

      // Collect all plugin entry points for injection
      const pluginPaths = options.pluginsOrder(pluginsObject.plugins.map(plugin => {
        if (plugin.name === 'adapt-contrib-core') return null;
        const requireJSRootPath = plugin.sourcePath.substr(options.baseUrl.length);
        const requireJSMainPath = path.join(requireJSRootPath, plugin.main);
        const ext = path.extname(requireJSMainPath);
        const requireJSMainPathNoExt = requireJSMainPath.slice(0, -ext.length).replace(convertSlashes, '/');
        return requireJSMainPathNoExt;
      }).filter(Boolean));

      // Collect react templates
      const reactTemplatePaths = [];
      options.reactTemplates.forEach(pattern => {
        grunt.file.expand({
          filter: options.pluginsFilter,
          order: options.pluginsOrder
        }, pattern).forEach(templatePath => {
          const requireJSRootPath = templatePath.substr(options.baseUrl.length);
          return reactTemplatePaths.push(requireJSRootPath.replace(convertSlashes, '/'));
        });
      });

      const isProduction = false;
      // These will be overridden/added to in the package.json of any plugin
      //  they are here for backward compatibility only
      const v5toV6DefaultMappings = {
        externalMap: {
          '.*/libraries/(?!mediaelement-fullscreen-hook)+': 'libraries/'
        },
        map: {
          'components/': '',
          'extensions/': '',
          'menu/': '',
          'theme/': '',
          'core/': 'adapt-contrib-core/',
          coreJS: 'adapt-contrib-core/js',
          coreViews: 'adapt-contrib-core/js/views',
          coreModels: 'adapt-contrib-core/js/models',
          coreCollections: 'adapt-contrib-core/js/collections',
          coreHelpers: 'adapt-contrib-core/js/helpers',
          // This library from the media component has a circular reference to core/js/adapt, it should be loaded after Adapt
          // It needs to be moved from the libraries folder to the js folder
          'libraries/mediaelement-fullscreen-hook': '../libraries/mediaelement-fullscreen-hook'
        },
        paths: {
          jquery: 'libraries/jquery.min',
          underscore: 'libraries/underscore.min',
          'underscore.results': 'libraries/underscore.results',
          backbone: 'libraries/backbone.min',
          'backbone.controller': 'libraries/backbone.controller',
          'backbone.controller.results': 'libraries/backbone.controller.results',
          'backbone.es6': 'libraries/backbone.es6',
          handlebars: 'libraries/handlebars.min',
          velocity: 'libraries/velocity.min',
          imageReady: 'libraries/imageReady',
          inview: 'libraries/inview',
          a11y: 'empty:',
          plugins: 'empty:',
          'libraries/': 'empty:',
          'regenerator-runtime': 'libraries/regenerator-runtime.min',
          'core-js': 'libraries/core-js.min',
          scrollTo: 'libraries/scrollTo.min',
          bowser: 'libraries/bowser',
          enum: 'libraries/enum',
          'core/js/libraries/bowser': 'empty:',
          'coreJS/libraries/bowser': 'empty:',
          'object.assign': 'empty:',
          jqueryMobile: 'libraries/jquery.mobile.custom.min',
          react: isProduction ? 'libraries/react.production.min' : 'libraries/react.development',
          'react-dom': isProduction ? 'libraries/react-dom.production.min' : 'libraries/react-dom.development',
          'html-react-parser': 'libraries/html-react-parser.min',
          semver: 'libraries/semver'
        }
      };

      // Process remapping and external model configurations
      const mappings = Object.assign(v5toV6DefaultMappings.map, pluginMappings.map);
      const mapParts = Object.keys(mappings);
      const externals = Object.assign(v5toV6DefaultMappings.paths, pluginMappings.paths);
      const externalParts = Object.keys(externals);
      const externalMap = (v5toV6DefaultMappings.externalMap);

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
              moduleId = moduleId.replace(mapPart, mappings[mapPart]);
            }
            // Remap ../libraries/ or core/js/libraries/ to libraries/
            moduleId = Object.entries(externalMap).reduce((moduleId, [ match, replaceWith ]) => moduleId.replace((new RegExp(match, 'g')), replaceWith), moduleId);
            const externalPart = externalParts.find(part => moduleId.startsWith(part));
            const isExternal = Boolean(externals[externalPart]);
            const isNodeModule = Boolean(externals[externalPart] === 'node_modules:');
            if (isExternal && !isNodeModule) {
              // External module as defined in paths
              return {
                id: moduleId,
                external: true
              };
            }
            try {
              // Resolve node modules
              if (!moduleId.includes('adapt-') && findNodeModule(cwd, options.baseUrl, moduleId)) {
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
            const isStart = (moduleId.includes('/' + options.baseUrl + options.name));
            if (!isStart) {
              return null;
            }

            const magicString = new MagicString(code);
            const matches = [...String(code).matchAll(/import .*;/g)];
            const last = matches[matches.length - 1];
            const end = last.index + last[0].length;

            const original = code.substr(0, end);
            const newPart = `\n${pluginPaths.map(filename => {
              return `import '${filename}';\n`;
            }).concat(reactTemplatePaths.map(filename => {
              return `import '${filename}';\n`;
            })).join('')}`;

            magicString.remove(0, end);
            magicString.prepend(original + newPart);

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
          replace({
            'process.env.NODE_ENV': isSourceMapped ? JSON.stringify('development') : JSON.stringify('production'),
            preventAssignment: true
          }),
          commonjs({
            exclude: ['**/node_modules/adapt-*/**'],
            sourceMap: isSourceMapped
          }),
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

      const clientSidePaths = Object.entries(externals)
        .filter(([, value]) => {
          // any forced node_module, at odds with the compatibility defaults
          const isNodeModule = (value === 'node_modules:');
          // general prefixes libraries/
          const isEmpty = (value === 'empty:');
          return (!isNodeModule && !isEmpty);
        })
        .reduce((output, [key, value]) => {
          output[key] = value;
          return output;
        }, {});

      const outputOptions = {
        file: options.out,
        format: 'amd',
        interop: false,
        banner: `
requirejs.config({
  map: {
    '*': ${JSON.stringify(mappings, null, 2)}
  },
  paths: ${JSON.stringify(clientSidePaths, null, 2)}
});
define('plugins', () => true);
(function requireJSMapExtension() {
  // Extend requirejs map with direct string replacement
  const requireJSMapConfig = requirejs.s.contexts._.config.map['*'];
  const remapConfigs = Object.entries(requireJSMapConfig).map(([ find, replaceWith ]) => {
    return {
      find: new RegExp("^" + find),
      replaceWith
    };
  });
  function stringReplaceModuleIds(original, ...args) {
    let [ names ] = args;
    const isArray = Array.isArray(names);
    if (!isArray) names = [names];
    names = names.map(name => {
      remapConfigs.forEach(({ find, replaceWith }) => {
        name = name.replace(find, replaceWith);
      });
      return name;
    });
    args[0] = isArray ? names : names[0];
    return original.apply(this, args);
  }
  function monkeyPunch(context, functionName, trap) {
    const original = context[functionName];
    context[functionName] = function(...args) {
      args.unshift(original);
      return trap.apply(context, args);
    };
  }
  monkeyPunch(requirejs.s.contexts._, 'require', stringReplaceModuleIds);
})();
`,
        plugins: [
          !isSourceMapped && terser({
            mangle: false,
            compress: false
          })
        ].filter(Boolean),
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

      const mainPath = path.resolve(cwd, options.baseUrl, options.name + '.js').replace(convertSlashes, '/');
      checkCache([mainPath]);
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
