var path = require('path');
var fs = require('fs');

module.exports = function (grunt, options) {

  var courseDir = path.join(options.sourcedir, 'course');

  if (options.outputdir.indexOf('build') > -1) {
    courseDir = path.join(options.outputdir, 'course');
  }

  var pathToConfig = path.join(courseDir, 'config.json')

  try {
    // Verify that the configuration file exists.
    fs.accessSync(pathToConfig);
  } catch(ex) {
    // If it does not, early return an empty configuration object, 
    // so the replace task can still run.
    return {
      dist: {
        options: {
          patterns: [
            {
              json: {}
            }
          ]
        },
        files: [
          {
            expand: true,
            flatten: true,
            src: [options.outputdir + '*.xml'],
            dest: options.outputdir
          }
        ]
      }
    }
  }
  
  var configJson = grunt.file.readJSON(pathToConfig);
  var defaultLanguage = configJson._defaultLanguage || 'en';
  var courseJson = grunt.file.readJSON(path.join(courseDir, defaultLanguage, 'course.json'));

  // A shim for edge cases where xAPI has not been configured.
  if (!configJson.hasOwnProperty('_xapi')) {
    configJson._xapi = {
      'activityID': '',
      '_isEnabled': false
    };
  } else {
    // xAPI has been enabled, check if the activityID has been set.
    if (configJson._xapi.hasOwnProperty('activityID') && configJson._xapi.activityID == '') {
      grunt.log.writeln('WARNING: xAPI activityID has not been set');
    }
  }

  // Combine the course and config JSON so both can be passed to replace.  
  var json = {
    'course': courseJson,
    'config': configJson
  };

  return {
    dist: {
      options: {
        patterns: [
          {
            json: json
          }
        ]
      },
      files: [
        {
          expand: true,
          flatten: true,
          src: [options.outputdir + '*.xml'],
          dest: options.outputdir
        }
      ]
    }
  }
}
