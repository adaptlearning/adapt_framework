module.exports = function (grunt, options) {

  var courseDir = options.sourcedir + 'course/';
  if (options.outputdir.indexOf('courses')) {
    courseDir = options.outputdir + 'course/';
  }

  var configJson = grunt.file.readJSON(courseDir + 'config.json');
  var defaultLanguage = configJson._defaultLanguage || 'en'
  var pathToCourseJson = courseDir + defaultLanguage + '/course.json';
  var courseJSON = grunt.file.readJSON(pathToCourseJson);
  
  return {
    dist: {
      options: {
        patterns: [
          {
            json: courseJSON
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