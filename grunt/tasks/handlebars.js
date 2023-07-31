/*
 * grunt-contrib-handlebars
 * http://gruntjs.com/
 *
 * Copyright (c) 2016 Tim Branyen, contributors
 * Licensed under the MIT license.
 */

'use strict';
const chalk = require('chalk');
const nsdeclare = require('nsdeclare');

module.exports = function(grunt) {
  const _ = grunt.util._;

  // content conversion for templates
  const defaultProcessContent = function(content) {
    return content;
  };

  // AST processing for templates
  const defaultProcessAST = function(ast) {
    return ast;
  };

  // filename conversion for templates
  const defaultProcessName = function(name) {
    return name;
  };

  // filename conversion for partials
  const defaultProcessPartialName = function(filepath) {
    const pieces = _.last(filepath.split('/')).split('.');
    let name = _(pieces).without(_.last(pieces)).join('.'); // strips file extension
    if (name.charAt(0) === '_') {
      name = name.substr(1, name.length); // strips leading _ character
    }
    return name;
  };

  const extractGlobalNamespace = function(nsDeclarations) {
    // Extract global namespace from any existing namespace declaration.
    // The purpose of this method is too fix an issue with AMD when using namespace as a function where the
    // nsInfo.namespace will contains the last namespace, not the global namespace.

    const declarations = _.keys(nsDeclarations);

    // no declaration found
    if (!declarations.length) {
      return '';
    }

    // In case only one namespace has been declared it will only return it.
    if (declarations.length === 1) {
      return declarations[0];
    }
    // We only need to take any declaration to extract the global namespace.
    // Another option might be find the shortest declaration which is the global one.
    // eslint-disable-next-line no-useless-escape
    const matches = declarations[0].match(/(this\[[^\[]+\])/g);
    return matches[0];
  };

  grunt.registerMultiTask('handlebars', 'Compile handlebars templates and partials.', function() {
    const options = this.options({
      namespace: 'JST',
      separator: grunt.util.linefeed + grunt.util.linefeed,
      wrapped: true,
      amd: false,
      commonjs: false,
      knownHelpers: [],
      knownHelpersOnly: false
    });

    // assign regex for partials directory detection
    const partialsPathRegex = options.partialsPathRegex || /./;

    // assign regex for partial detection
    const isPartialRegex = options.partialRegex || /^_/;

    // assign transformation functions
    const processContent = options.processContent || defaultProcessContent;
    const processName = options.processName || defaultProcessName;
    const processPartialName = options.processPartialName || defaultProcessPartialName;
    const processAST = options.processAST || defaultProcessAST;
    const useNamespace = options.namespace !== false;

    // assign compiler options
    const compilerOptions = options.compilerOptions || {};
    let filesCount = 0;

    this.files.forEach(function(f) {
      const declarations = [];
      const partials = {};
      const templates = {};
      // template identifying parts
      let ast, compiled, filename;

      // Namespace info for current template
      let nsInfo;

      // Map of already declared namespace parts
      const nsDeclarations = {};

      // nsdeclare options when fetching namespace info
      const nsDeclareOptions = {
        response: 'details',
        declared: nsDeclarations
      };

      // Just get the namespace info for a given template
      const getNamespaceInfo = _.memoize(function(filepath) {
        if (!useNamespace) {
          return undefined;
        }
        if (_.isFunction(options.namespace)) {
          return nsdeclare(options.namespace(filepath), nsDeclareOptions);
        }
        return nsdeclare(options.namespace, nsDeclareOptions);
      });

      // iterate files, processing partials and templates separately
      f.src.filter(function(filepath) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn(`Source file '${filepath}' not found.`);
          return false;
        }
        return true;
      })
        .forEach(function(filepath) {
          const src = processContent(grunt.file.read(filepath), filepath);

          const Handlebars = require('handlebars');
          try {
            // parse the handlebars template into it's AST
            ast = processAST(Handlebars.parse(src));
            compiled = Handlebars.precompile(ast, compilerOptions);

            // if configured to, wrap template in Handlebars.template call
            if (options.wrapped === true) {
              compiled = `Handlebars.template(${compiled})`;
            }
          } catch (e) {
            const title = `Handlebars failed to compile ${filepath}.`;
            e.message = `${title}\n${e.message}`;
            console.error(e.toString());
            grunt.fail.fatal(title);
          }

          let stringifiedFileName;
          // register partial or add template to namespace
          if (partialsPathRegex.test(filepath) && isPartialRegex.test(_.last(filepath.split('/')))) {
            filename = processPartialName(filepath);
            stringifiedFileName = JSON.stringify(filename);
            if (options.partialsUseNamespace === true) {
              nsInfo = getNamespaceInfo(filepath);
              if (nsInfo.declaration) {
                declarations.push(nsInfo.declaration);
              }
              partials[`${nsInfo.namespace}:${stringifiedFileName}`] = ('Handlebars.registerPartial(' +
                stringifiedFileName + ', ' + nsInfo.namespace + '[' + stringifiedFileName + '] = ' +
                compiled + ');');
            } else {
              partials[stringifiedFileName] = ('Handlebars.registerPartial(' + stringifiedFileName +
                ', ' + compiled + ');');
            }
          } else {
            if ((options.amd || options.commonjs) && !useNamespace) {
              compiled = 'return ' + compiled;
            }
            filename = processName(filepath);
            stringifiedFileName = JSON.stringify(filename);
            if (useNamespace) {
              nsInfo = getNamespaceInfo(filepath);
              if (nsInfo.declaration) {
                declarations.push(nsInfo.declaration);
              }
              templates[`${nsInfo.namespace}:${stringifiedFileName}`] = (nsInfo.namespace + '[' +
                stringifiedFileName + '] = ' + compiled + ';');
            } else if (options.commonjs === true) {
              templates[stringifiedFileName] = compiled + ';';
            } else {
              templates[stringifiedFileName] = compiled;
            }
          }
        });

      const output = declarations.concat(_.values(partials), _.values(templates));
      if (output.length < 1) {
        grunt.log.warn('Destination not written because compiled files were empty.');
      } else {
        if (useNamespace) {
          if (options.node) {
            output.unshift('Handlebars = glob.Handlebars || require(\'handlebars\');');
            output.unshift('var glob = (\'undefined\' === typeof window) ? global : window,');

            let nodeExport = 'if (typeof exports === \'object\' && exports) {';
            nodeExport += `module.exports = ${nsInfo.namespace};}`;

            output.push(nodeExport);
          }

        }

        if (options.amd) {
          // Wrap the file in an AMD define fn.
          if (typeof options.amd === 'boolean') {
            output.unshift('define([\'handlebars\'], function(Handlebars) {');
          } else if (typeof options.amd === 'string') {
            output.unshift(`define(['${options.amd}'], function(Handlebars) {`);
          } else if (typeof options.amd === 'function') {
            output.unshift(`define(['${options.amd(filename, ast, compiled)}'], function(Handlebars) {`);
          } else if (Array.isArray(options.amd)) {
            // convert options.amd to a string of dependencies for require([...])
            let amdString = '';
            for (let i = 0; i < options.amd.length; i++) {
              if (i !== 0) {
                amdString += ', ';
              }

              amdString += `'${options.amd[i]}'`;
            }

            // Wrap the file in an AMD define fn.
            output.unshift(`define([${amdString}], function(Handlebars) {`);
          }

          if (useNamespace) {
            // Namespace has not been explicitly set to false; the AMD
            // wrapper will return the object containing the template.
            output.push(`return ${extractGlobalNamespace(nsDeclarations)};`);
          }
          output.push('});');
        }

        if (options.commonjs) {
          if (useNamespace) {
            output.push(`return ${nsInfo.namespace};`);
          }
          // Export the templates object for CommonJS environments.
          output.unshift('module.exports = function(Handlebars) {');
          output.push('};');
        }

        filesCount++;
        grunt.file.write(f.dest, output.join(grunt.util.normalizelf(options.separator)));
        grunt.verbose.writeln(`File ${chalk.cyan(f.dest)} created.`);
      }
    });

    grunt.log.ok(`${filesCount} ${grunt.util.pluralize(filesCount, 'file/files')} created.`);
  });
};
