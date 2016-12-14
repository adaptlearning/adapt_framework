var fs = require("fs");
var path = require("path");

module.exports = function (grunt) {

  grunt.registerTask("_saveCourseData", function () {
    
    var srcPath = grunt.config("sourcedir");
    var targetLang = grunt.config("translate.targetLang");
    
    [
      "course",
      "contentObjects",
      "articles",
      "blocks",
      "components"
    ].forEach(function (filename) {
      var src = path.join(srcPath, "course", targetLang, filename+".json");
      grunt.file.write(src, JSON.stringify(global.translate.courseData[filename],"",4));
    });
    
  });
  
};
