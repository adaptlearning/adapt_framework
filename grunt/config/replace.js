var path = require('path');
var fs = require('fs');
var _ = require('underscore');

module.exports = function(grunt, options) {

  var courseDir = path.join(options.outputdir, 'course');

  var filterNullValues = function(obj) {
    // hack to fix bug https://github.com/adaptlearning/adapt_framework/issues/1867

    if (obj instanceof Array) {
      for (var i = obj.length - 1; i >= 0; i--) {
        var value = obj[i];
        if (value === null) {
          obj.splice(i, 1);
        } else if (typeof value === "object") {
          obj[i] = filterNullValues(value);
        }
      }
    } else if (typeof obj === "object") {
      for (var k in obj) {
        var value = obj[k];
        if (value === null) {
          delete obj[k];
        } else if (typeof value === "object") {
          obj[k] = filterNullValues(value);
        }
      }
    }

    return obj;

  };

  var generatePatterns = function() {
    var jsonext = grunt.config('jsonext');
    var pathToConfig = path.join(courseDir, 'config.' + jsonext);

    try {
      // Verify that the configuration file exists.
      fs.accessSync(pathToConfig);

      var configJson = grunt.file.readJSON(pathToConfig);
      var defaultLanguage = configJson._defaultLanguage || 'en';
      var courseJson = grunt.file.readJSON(path.join(courseDir, defaultLanguage, 'course.' + jsonext));

      // Backwards compatibility for courses missing 'description'
      if (!courseJson.hasOwnProperty('description')) {
        courseJson.description = '';
      }

      // A shim for edge cases where xAPI has not been configured.
      if (!configJson.hasOwnProperty('_xapi')) {
        configJson._xapi = {
          '_activityID': '',
          '_isEnabled': false
        };
      } else {
        // xAPI has been enabled, check if the activityID has been set.
        if (configJson._xapi.hasOwnProperty('_activityID') && configJson._xapi._activityID == '') {
          grunt.log.writeln('WARNING: xAPI activityID has not been set');
        }
      }

      // Shim to preserve the 'adapt_manifest' identifier.
      var spoor = configJson._spoor;
      if (spoor) {
        spoor._advancedSettings = spoor._advancedSettings || {};
        spoor._advancedSettings._manifestIdentifier = spoor._advancedSettings._manifestIdentifier || 'adapt_manifest';
      }

      // Combine the course and config JSON so both can be passed to replace.  
      return {
        'course': filterNullValues(courseJson),
        'config': filterNullValues(configJson)
      };
    } catch (ex) {
      return {};
    }
  };

  return {
    dist: {
      options: {
        silent: true,
        patterns: [
          {
            json: function(done) {
              done(generatePatterns());
            }
          }
        ]
      },
      files: [
        {
          expand: true,
          flatten: true,
          src: [
            path.join(options.outputdir, '*.xml'),
            path.join(options.outputdir, '*.html')
          ],
          dest: options.outputdir
        }
      ]
    }
  };
}
