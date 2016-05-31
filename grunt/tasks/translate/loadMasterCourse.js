var fs = require("fs");
var path = require("path");

module.exports = function (grunt) {
  
  grunt.registerTask("_loadMasterCourse", function () {
    
    global.translate.courseData = {};
    
    var targetLang = grunt.config("translate.targetLang");
    var masterLang = grunt.config("translate.masterLang");
    var srcPath = grunt.config("sourcedir");
    
    copyCourse();
    getCourseDate();
    
    
    function copyCourse () {
      grunt.file.copy(path.join(srcPath,"course",masterLang,"course.json"), path.join(srcPath,"course",targetLang,"course.json"));
      grunt.file.copy(path.join(srcPath,"course",masterLang,"contentObjects.json"), path.join(srcPath,"course",targetLang,"contentObjects.json"));
      grunt.file.copy(path.join(srcPath,"course",masterLang,"articles.json"), path.join(srcPath,"course",targetLang,"articles.json"));
      grunt.file.copy(path.join(srcPath,"course",masterLang,"blocks.json"), path.join(srcPath,"course",targetLang,"blocks.json"));
      grunt.file.copy(path.join(srcPath,"course",masterLang,"components.json"), path.join(srcPath,"course",targetLang,"components.json"));
    }
    
    function getCourseDate () {
      ["course", "contentObjects", "articles", "blocks", "components"].forEach(function (filename) {
        var src = path.join(srcPath,"course",targetLang,filename+".json");
        
        global.translate.courseData[filename] = {};
        global.translate.courseData[filename] = grunt.file.readJSON(src);
      });
    }
  
  });
  
};

