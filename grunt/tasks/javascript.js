module.exports = function(grunt) {

  const convertSlashes = /\\/g;

  function escapeRegExp(string) {
    return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  }

  const path = require('path');
  const fs = require('fs-extra');
  const rollup = require('rollup');
  const { babel, getBabelOutputPlugin } = require('@rollup/plugin-babel');
  const { deflate, unzip, constants } = require('zlib');

  const cwd = process.cwd().replace(convertSlashes, '/') + '/';
  const isDisableCache = process.argv.includes('--disable-cache');
  let cache;

  const extensions = ['.js'];

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
    const dependents = {};
    const missing = {};
    cache.modules.forEach(mod => {
      const moduleId = mod.id;
      const isRollupHelper = (moduleId[0] === '\u0000');
      if (isRollupHelper) {
        // Ignore as injected rollup module
        return null;
      }
      mod.dependencies.forEach(depId => {
        dependents[depId] = dependents[depId] || [];
        dependents[depId].push(moduleId);
      });
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
    Object.keys(missing).forEach(moduleId => {
      if (!dependents[moduleId]) return;
      dependents[moduleId].forEach(depId => {
        if (!idHash[depId]) return;
        grunt.log.ok(`Cache invalidating file: ${depId.replace(cwd, '')}`);
        delete idHash[depId];
      });
    });
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
          console.log('error', err);
      }
      if (!hasOutput) {
        grunt.log.error(err.message);
        grunt.log.error(`Line: ${err.loc.line}, Col: ${err.loc.column}, File: ${err.id.replace(cwd, '')}`);
        console.log(err.frame);
        hasOutput = true;
      }
    }
    if (!hasOutput) {
      cache = null;
      saveCache(cachePath, basePath, cache);
      console.log(err);
    }
  };

  grunt.registerMultiTask('javascript', 'Compile JavaScript files', async function() {
    grunt.log.ok(`Cache disabled (--disable-cache): ${isDisableCache}`);
    const done = this.async();
    const options = this.options({});
    const isSourceMapped = Boolean(options.generateSourceMaps);
    const basePath = path.resolve(cwd + '/' + options.baseUrl).replace(convertSlashes, '/') + '/';
    await restoreCache(options.cachePath, basePath);
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

    // Process remapping and external model configurations
    const mapParts = Object.keys(options.map);
    const externalParts = Object.keys(options.external);

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
          }).join(',')}], function() {});`;
          return code;
        }

      };
    };

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
              '@babel/preset-env',
              {
                targets: {
                  ie: '11'
                },
                exclude: [
                  // Breaks lockingModel.js, set function vs set variable
                  'transform-function-name'
                ]
              }
            ]
          ],
          plugins: [
            [
              'transform-amd-to-es6',
              {
                amdToES6Modules: true,
                amdDefineES6Modules: true,
                defineFunctionName: '__AMD',
                defineModuleId: (moduleId) => moduleId.replace(convertSlashes, '/').replace(basePath, '').replace('.js', ''),
                excludes: []
              }
            ]
          ]
        })
      ],
      cache
    };

    const umdImport = () => {
      return umdImports.map(filename => {
        let code = fs.readFileSync(filename).toString();
        code = code
          .replace(`require("object-assign")`, 'Object.assign')
          .replace(`define.amd`, 'define.noop');
        return code;
      }).join('\n');
    };

    const outputOptions = {
      file: options.out,
      format: 'amd',
      plugins: [
        !isSourceMapped && getBabelOutputPlugin({
          minified: true,
          compact: true,
          comments: false,
          allowAllFormats: true
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
      }
    };

    try {
      checkCache([pluginsPath]);
      const bundle = await rollup.rollup(inputOptions);
      await saveCache(options.cachePath, basePath, bundle.cache);
      await bundle.write(outputOptions);
    } catch (err) {
      logPrettyError(err, options.cachePath, basePath);
    }

    // Remove old sourcemap if no longer required
    if (!isSourceMapped && fs.existsSync(options.out + '.map')) {
      fs.unlinkSync(options.out + '.map');
    }

    done();

  });
};
