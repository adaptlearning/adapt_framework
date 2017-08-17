var path = require('path');
var fs = require('fs');
var _ = require('underscore');

module.exports = function (grunt, options) {

  var courseDir = path.join(options.sourcedir, 'course');

  if (options.outputdir.indexOf('build') > -1) {
    courseDir = path.join(options.outputdir, 'course');
  }

  var pathToConfig = path.join(courseDir, 'config.json');

  var generatePatterns = function() {
    try {
      // Verify that the configuration file exists.
      fs.accessSync(pathToConfig);
      
      var configJson = grunt.file.readJSON(pathToConfig);
      var defaultLanguage = configJson._defaultLanguage || 'en';
      var courseJson = grunt.file.readJSON(path.join(courseDir, defaultLanguage, 'course.json'));
      
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

        // cmi5 is a profile of the xAPI specification and some systems, e.g. SCORM Cloud
        // do not work well with both manifest types, so remove the one which is not being used.
        if (configJson._xapi.hasOwnProperty('_specification')) {
          if (configJson._xapi._specification === 'xAPI') {
            // Remove the cmi5.xml file.
            grunt.file.delete(path.join(options.outputdir, 'cmi5.xml'));
          } else if (configJson._xapi._specification === 'cmi5') {
            // Remove the tincan.xml file.
            grunt.file.delete(path.join(options.outputdir, 'tincan.xml'));
          }
        }
      }

      // Ensure that only whitelisted attributes can be replaced.
      courseJson = _.pick(courseJson, 'title', 'displayTitle', 'body', 'description');
      configJson = _.pick(configJson, '_xapi', '_spoor');
      
      // Combine the course and config JSON so both can be passed to replace.  
      return {
        'course': courseJson,
        'config': configJson
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
            json: function (done) {
              done(generatePatterns());
            }
          }
        ]
      },
      files: [
        {
          expand: true,
          flatten: true,
          src: [path.join(options.outputdir, '*.xml')],
          dest: options.outputdir
        }
      ]
    }
  };
}
