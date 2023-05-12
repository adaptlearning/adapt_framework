module.exports = function(grunt) {
  const convertSlashes = /\\/g;

  grunt.registerMultiTask('less', 'Compile LESS files to CSS', function() {
    const less = require('less');
    const _ = require('underscore');
    const path = require('path');
    const Visitors = require('./less/visitors');
    const done = this.async();
    const options = this.options({});

    const rootPath = path.join(path.resolve(options.baseUrl), '../')
      .replace(convertSlashes, '/');
    const cwd = process.cwd();

    let imports = '';
    let src = '';

    if (options.src && options.config) {
      let screenSize;
      try {
        const configjson = JSON.parse(grunt.file.read(options.config)
          .toString());
        screenSize = configjson?.screenSize;
      } catch (e) {}
      if (!screenSize) {
        const error = new Error('No screenSize defined in config.json');
        const errorString = error.toString();
        console.error(errorString);
        grunt.fail.fatal(errorString);
        return;
      }
      const screensizeEmThreshold = 300;
      const baseFontSize = 16;
      for (const [name, value] of Object.entries(screenSize)) {
        // Check to see if the screen size value is larger than the em threshold
        // If value is larger than em threshold, convert value (assumed px) to ems
        // Otherwise assume value is in ems
        screenSize[name] = value > screensizeEmThreshold
          ? value / baseFontSize
          : value;
      }
      // Add less variables
      imports += Object.entries(screenSize).map(([name, value]) => {
        return `\n@adapt-device-${name}: ${value}em;`;
      }).join('');
      // Add css variables
      imports += `\n:root {\n ${Object.entries(screenSize).map(([name, value]) => {
        return `\n  --adapt-device-${name}: ${value}em;`;
      }).join('')}\n}`;
    }

    if (options.mandatory) {
      for (let i = 0, l = options.mandatory.length; i < l; i++) {
        src = path.join(cwd, options.mandatory[i]);
        grunt.file.expand({
          follow: true,
          order: options.order
        }, src)
          .forEach(function(lessPath) {
            lessPath = path.normalize(lessPath);
            const trimmed = lessPath.substr(rootPath.length);
            imports += "@import '" + trimmed + "';\n";
          });
      }
    }

    if (options.src) {
      for (let i = 0, l = options.src.length; i < l; i++) {
        src = path.join(cwd, options.src[i]);
        grunt.file.expand({
          follow: true,
          filter: options.filter,
          order: options.order
        }, src)
          .forEach(function(lessPath) {
            lessPath = path.normalize(lessPath);
            const trimmed = lessPath.substr(rootPath.length);
            imports += "@import '" + trimmed + "';\n";
          });
      }
    }

    let sourcemaps;
    if (options.sourcemaps) {
      sourcemaps = {
        sourceMap: {
          sourceMapFileInline: false,
          outputSourceFiles: true,
          sourceMapBasepath: 'src',
          sourceMapURL: options.mapFilename
        }
      };
    } else {
      const sourceMapPath = path.join(options.dest, options.mapFilename);
      if (grunt.file.exists(sourceMapPath)) {
        grunt.file.delete(sourceMapPath, {
          force: true
        });
      }
      if (grunt.file.exists(sourceMapPath + '.imports')) {
        grunt.file.delete(sourceMapPath + '.imports', {
          force: true
        });
      }
    }

    const visitors = new Visitors(options);

    const lessOptions = _.extend({
      compress: options.compress,
      plugins: [
        visitors
      ]
    }, sourcemaps);

    less.render(imports, lessOptions, complete);

    function complete(error, output) {

      visitors.flushLog();

      if (error) {
        const errorString = error.toString();
        console.error(errorString);
        grunt.fail.fatal(errorString);
        return;
      }

      grunt.file.write(path.join(options.dest, options.cssFilename), output.css);

      if (output.map) {
        grunt.file.write(path.join(options.dest, options.mapFilename) + '.imports', imports);
        grunt.file.write(path.join(options.dest, options.mapFilename), output.map);
      }
      done();
    }
  });
};
