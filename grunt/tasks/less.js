module.exports = function(grunt) {
  var convertSlashes = /\\/g;

  grunt.registerMultiTask('less', 'Compile LESS files to CSS', function() {
    var less = require('less');
    var _ = require('underscore');
    var path = require('path');
    var Visitors = require('./less/visitors');
    var done = this.async();
    var options = this.options({});

    var rootPath = path.join(path.resolve(options.baseUrl), '../')
      .replace(convertSlashes, '/');
    var cwd = process.cwd();

    var imports = '';
    var src = '';

    if (options.src && options.config) {
      var screenSize = {
        'small': 520,
        'medium': 760,
        'large': 900
      };
      try {
        var configjson = JSON.parse(grunt.file.read(options.config)
          .toString());
        screenSize = configjson.screenSize || screenSize;
      } catch (e) {}

      var screensizeEmThreshold = 300;
      var baseFontSize = 16;

      // Check to see if the screen size value is larger than the em threshold
      // If value is larger than em threshold, convert value (assumed px) to ems
      // Otherwise assume value is in ems
      var largeEmBreakpoint = screenSize.large > screensizeEmThreshold ?
        screenSize.large / baseFontSize :
        screenSize.large;
      var mediumEmBreakpoint = screenSize.medium > screensizeEmThreshold ?
        screenSize.medium / baseFontSize :
        screenSize.medium;
      var smallEmBreakpoint = screenSize.small > screensizeEmThreshold ?
        screenSize.small / baseFontSize :
        screenSize.small;

      imports += `\n@adapt-device-large: ${largeEmBreakpoint}em;`;
      imports += `\n@adapt-device-medium: ${mediumEmBreakpoint}em;`;
      imports += `\n@adapt-device-small: ${smallEmBreakpoint}em;\n`;
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
            var trimmed = lessPath.substr(rootPath.length);
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
            var trimmed = lessPath.substr(rootPath.length);
            imports += "@import '" + trimmed + "';\n";
          });
      }
    }

    var sourcemaps;
    if (options.sourcemaps) {
      sourcemaps = {
        'sourceMap': {
          'sourceMapFileInline': false,
          'outputSourceFiles': true,
          'sourceMapBasepath': 'src',
          'sourceMapURL': options.mapFilename
        }
      };
    } else {
      var sourceMapPath = path.join(options.dest, options.mapFilename);
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

    var visitors = new Visitors(options);

    var lessOptions = _.extend({
      'compress': options.compress,
      'plugins': [
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
