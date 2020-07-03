module.exports = function(grunt) {

  function escapeRegExp(string) {
    return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  }

  const path = require('path');
  const fs = require('fs-extra');
  const rollup = require('rollup');
  const { babel, getBabelOutputPlugin } = require('@rollup/plugin-babel');
  const Module = require('./amd-to-es6/class/Module');
  const { deflate, unzip, gunzip, gzip, constants } = require('zlib');

  const convertSlashes = /\\/g;
  const hasDefineOrRequire = /\b(?:define)|(?:require)\b/;

  let cache;

  const restoreCache = async (basePath) => {
    if (cache || !fs.existsSync('./build/.cache')) return;
    await new Promise((resolve, reject) => {
      const buffer = fs.readFileSync('./build/.cache');
      unzip(buffer, (err, buffer) => {
        if (err) {
          console.error('An error occurred restoring rollup cache:', err);
          process.exitCode = 1;
          reject();
          return;
        }
        let str = buffer.toString();
        // restore cache to current basePath
        str = str.replace(/%%basePath%%/g, basePath);
        cache = JSON.parse(str);
        resolve();
      });
    });
  };

  const saveCache = async (basePath, bundleCache) => {
    cache = bundleCache;
    await new Promise((resolve, reject) => {
      let str = JSON.stringify(cache);
      // make cache location agnostic
      str = str.replace(new RegExp(escapeRegExp(basePath), 'g'), '%%basePath%%');
      deflate(str, { level: constants.Z_BEST_COMPRESSION }, (err, buffer) => {
        if (err) {
          console.error('An error occurred saving rollup cache:', err);
          process.exitCode = 1;
          reject();
          return;
        }
        fs.writeFileSync('./build/.cache', buffer);
        resolve();
      });
    });
  };

  grunt.registerMultiTask('javascript', 'Compile JavaScript files', async function() {
    const done = this.async();
    const options = this.options({});
    const isSourceMapped = Boolean(options.generateSourceMaps);
    const basePath = path.resolve(process.cwd() + '/' + options.baseUrl).replace(convertSlashes,'/')  + '/';
    await restoreCache(basePath);

    // Make src/plugins.js to attach the plugins to
    if (!fs.existsSync(options.pluginsPath)) {
      fs.writeFileSync(options.pluginsPath, '');
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

    // Rework amd define and require statements into ES import directives
    const amd = function(config = {}) {
      return {
        name: 'amd',
        resolveId(moduleId, parentId) {
          //console.log(moduleId);
          const isRollupHelper = (moduleId[0] === "\u0000");
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
          const endsWithJS = moduleId.endsWith('.js');
          if (isRelative) {
            if (!parentId) {
              // Rework app.js path
              const filename = path.resolve(moduleId + (endsWithJS ? '' : '.js')).replace(convertSlashes,'/');
              return {
                id: filename,
                external: false
              };
            }
            // Rework relative paths into absolute ones
            const filename = path.resolve(parentId + '/../' + moduleId + (endsWithJS ? '' : '.js')).replace(convertSlashes,'/');
            return {
              id: filename,
              external: false
            };
          }
          const externalPart = externalParts.find(part => moduleId.startsWith(part));
          const isEmpty = (options.external[externalPart] === 'empty:');
          if (isEmpty) {
            // External module as defined 'empty:', libraries/ bower handlebars etc
            return {
              id: moduleId,
              external: true
            };
          }
          const isES6Import = !fs.existsSync(moduleId);
          if (isES6Import) {
            // ES6 imports start inside ./src so need correcting
            const filename = path.resolve(process.cwd() + '/' + options.baseUrl + moduleId + (endsWithJS ? '' : '.js')).replace(convertSlashes,'/');
            return {
              id: filename,
              external: false
            };
          }
          // Normalize all absolute paths as conflicting slashes will load twice
          moduleId = moduleId.replace(convertSlashes, '/');
          return {
            id: moduleId + (endsWithJS ? '' : '.js'),
            external: false
          };
        },
        transform(code, moduleId) {
          const isRollupHelper = (moduleId[0] === "\u0000");
          if (isRollupHelper) {
            return null;
          }
          const isPlugins = (moduleId.includes('/'+options.pluginsModule+'.js'));
          if (isPlugins) {
            // Dynamically construct plugins.js with plugin dependencies
            code = `define([${pluginPaths.map(filename => {
              return `"${filename}"`;
            }).join(',')}], function() {});`;
          }
          // Rework require/define into import
          // Rework ES export default directives to register as amd modules client-side
          const isAmdModule = hasDefineOrRequire.test(code);
          if (isAmdModule) {
            code = code.replace(/^require/,'define');
          }
          const module = new Module(code);
          if (isAmdModule) {
            // Convert require/define/return to import/export directives
            module.convert({});
          }
          const node = module._tree.body.find(node => node.type === 'ExportDefaultDeclaration');
          if (!node && !isAmdModule) {
            // If no default export and is not an amd module then return early
            return null;
          }
          if (node) {
            const shortId = moduleId.replace(convertSlashes,'/').replace(basePath, '').replace('\.js', '');
            // Wrap default export with call to __AMD to define the module client-side
            const arg = { ...node.declaration };
            node.declaration.replacement = {
              parent: 'declaration',
              child: {
                arguments: [{ type: "Literal", value: shortId }, arg],
                callee: { name: "__AMD", type: "Identifier" },
                type: "CallExpression"
              }
            };
            module.transformTree();
          }
          return {
            code: module.source,
            map: module.map
          };
        }
      };
    };

    const inputOptions = {
      input: './' + options.baseUrl +  options.name,
      shimMissingExports: true,
      plugins: [
        amd({
          sourceMap: isSourceMapped
        }),
        babel({
          babelHelpers: 'bundled',
          minified: false,
          compact: false,
          comments: false,
          presets: [
            [
              '@babel/preset-env',
              {
                targets: {
                  ie: '11'
                }
              }
            ]
          ]
        })
      ],
      cache
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
      const bundle = await rollup.rollup(inputOptions);
      await saveCache(basePath, bundle.cache);
      await bundle.write(outputOptions);
    } catch (err) {
      console.log(err);
    }

    // Remove old sourcemap if no longer required
    if (!isSourceMapped && fs.existsSync(options.out + ".map")) {
      fs.unlinkSync(options.out + ".map");
    }

    done();

  });
};
