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
      '_activityID': '',
      '_isEnabled': false
    };
  }
  
  function generateUUID() {
      var d = new Date().getTime();
      var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = (d + Math.random()*16)%16 | 0;
          d = Math.floor(d/16);
          return (c=='x' ? r : (r&0x3|0x8)).toString(16);
      });
      return uuid;
  };
  
  if (configJson.hasOwnProperty('_xapi') && configJson._xapi._activityID == '') {
    configJson._xapi._activityID = grunt.option('domain') + '/activity/' + generateUUID();  
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