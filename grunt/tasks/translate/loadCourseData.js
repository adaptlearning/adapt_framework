var path = require("path");

module.exports = function (grunt) {
  
  grunt.registerTask("_loadCourseData", function () {
    
    var srcPath = grunt.config("sourcedir");
    var lang = grunt.config("translate.masterLang");
    
    // check if master language course exists
    if (!grunt.file.isDir(srcPath, "course", lang)) {
        throw grunt.util.error("Folder "+lang+" does not exist in your Adapt course.");
    }

    global.translate.courseData = {};
    global.translate.courseData.config = grunt.file.readJSON(path.join(srcPath,"course","config.json"));
    global.translate.courseData.course = grunt.file.readJSON(path.join(srcPath,"course",lang,"course.json"));
    global.translate.courseData.contentObjects = grunt.file.readJSON(path.join(srcPath,"course",lang,"contentObjects.json"));
    global.translate.courseData.articles = grunt.file.readJSON(path.join(srcPath,"course",lang,"articles.json"));
    global.translate.courseData.blocks = grunt.file.readJSON(path.join(srcPath,"course",lang,"blocks.json"));
    global.translate.courseData.components = grunt.file.readJSON(path.join(srcPath,"course",lang,"components.json"));
  });
  
};
