var path = require("path");

module.exports = function(grunt) {

  grunt.registerTask("_loadCourseData", function() {

    var srcPath = grunt.config("sourcedir");
    if (grunt.option("outputdir")) srcPath = grunt.config("outputdir");

    var lang = grunt.config("translate.masterLang");
    var jsonext = grunt.config('jsonext');

    // check if master language course exists
    if (!grunt.file.isDir(srcPath, "course", lang)) {
      throw grunt.util.error("Folder " + lang + " does not exist in your Adapt course.");
    }

    var fileMap = {
      "config": [srcPath, "course", "config." + jsonext],
      "course": [srcPath, "course", lang, "course." + jsonext],
      "contentObjects": [srcPath, "course", lang, "contentObjects." + jsonext],
      "articles": [srcPath, "course", lang, "articles." + jsonext],
      "blocks": [srcPath, "course", lang, "blocks." + jsonext],
      "components": [srcPath, "course", lang, "components." + jsonext]
    };

    global.translate.courseData = {};

    for (var file in fileMap) {
      if (fileMap.hasOwnProperty(file)) {
        var src = path.join.apply(null, fileMap[file]);

        global.translate.courseData[file] = grunt.file.readJSON(src);
      }
    }

  });

};
