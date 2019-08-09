var fs = require("fs");
var path = require("path");

module.exports = function(grunt) {

  grunt.registerTask("_loadMasterCourse", function() {

    global.translate.courseData = {};

    var targetLang = grunt.config("translate.targetLang");
    var masterLang = grunt.config("translate.masterLang");
    var srcPath = grunt.option("outputdir") || grunt.config("sourcedir");
    var jsonext = grunt.config('jsonext');

    checkCourseExists();
    copyCourse();
    getCourseData();

    function checkCourseExists() {
      if (grunt.file.isDir(srcPath, "course", targetLang) && !grunt.config('translate.shouldReplaceExisting')) {
        throw grunt.util.error(targetLang + " folder already exist, to replace the content in this folder, please add a --replace flag to the grunt task.");
      }

      if (!grunt.file.isDir(srcPath, "course", masterLang)) {
        throw grunt.util.error("Folder " + masterLang + " does not exist in your Adapt course.");
      }
    }

    function copyCourse() {
      grunt.file.copy(path.join(srcPath, "course", masterLang, "course." + jsonext), path.join(srcPath, "course", targetLang, "course." + jsonext));
      grunt.file.copy(path.join(srcPath, "course", masterLang, "contentObjects." + jsonext), path.join(srcPath, "course", targetLang, "contentObjects." + jsonext));
      grunt.file.copy(path.join(srcPath, "course", masterLang, "articles." + jsonext), path.join(srcPath, "course", targetLang, "articles." + jsonext));
      grunt.file.copy(path.join(srcPath, "course", masterLang, "blocks." + jsonext), path.join(srcPath, "course", targetLang, "blocks." + jsonext));
      grunt.file.copy(path.join(srcPath, "course", masterLang, "components." + jsonext), path.join(srcPath, "course", targetLang, "components." + jsonext));
    }

    function getCourseData() {
      ["config"].forEach(function(filename) {
        var src = path.join(srcPath, "course", filename + "." + jsonext);

        global.translate.courseData[filename] = {};
        global.translate.courseData[filename] = grunt.file.readJSON(src);
      });
      ["course", "contentObjects", "articles", "blocks", "components"].forEach(function(filename) {
        var src = path.join(srcPath, "course", targetLang, filename + "." + jsonext);

        global.translate.courseData[filename] = {};
        global.translate.courseData[filename] = grunt.file.readJSON(src);
      });
    }
  });
};
