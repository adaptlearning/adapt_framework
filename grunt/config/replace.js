module.exports = function (grunt, options) {

  var courseDir = options.sourcedir + 'course/';

  if (options.outputdir.indexOf('build/') > -1) {
    courseDir = options.outputdir + 'course/';
  }

  var configJson = grunt.file.readJSON(courseDir + 'config.json');
  var defaultLanguage = configJson._defaultLanguage || 'en';
  var courseJson = grunt.file.readJSON(courseDir + defaultLanguage + '/course.json');

  // Backwards compatibility for courses missing 'description'
  if (!courseJson.hasOwnProperty('description')) {
    courseJson.description = '';
  }

  // A shim for edge cases where xAPI has not been configured.
  if (!configJson.hasOwnProperty('_xapi')) {
    configJson._xapi = {
      'activityID': '',
      '_isEnabled': false
    };
  }

  // Combine the course and config JSON so both can be passet to replace.  
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