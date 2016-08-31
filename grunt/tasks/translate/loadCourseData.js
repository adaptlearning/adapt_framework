var path = require("path");

module.exports = function (grunt) {
  
  grunt.registerTask("_loadCourseData", function () {
    
    var srcPath = grunt.config("sourcedir");
    var lang = grunt.config("translate.masterLang");
    
    // check if master language course exists
    if (!grunt.file.isDir(srcPath, "course", lang)) {
        throw grunt.util.error("Folder "+lang+" does not exist in your Adapt course.");
    }

    var fileMap = {
        "config": [srcPath,"course","config.json"],
        "course": [srcPath,"course",lang,"course.json"],
        "contentObjects": [srcPath,"course",lang,"contentObjects.json"],
        "articles": [srcPath,"course",lang,"articles.json"],
        "blocks": [srcPath,"course",lang,"blocks.json"],
        "components": [srcPath,"course",lang,"components.json"]
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
