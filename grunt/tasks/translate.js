module.exports = function(grunt) {
  
    var Helper = require("./translate/helper.js")(grunt);
    Helper.loadSubTasks();

    grunt.registerTask('translate:export', 'Export Course Data into Language files ready to be translated', [
      "_loadTranslateConfig",
      "_loadCourseData",
      "_parseSchemaFiles",
      "_createLookupTables",
      "_extractCourseData",
      "_exportLangFiles"
    ]);

    grunt.registerTask("translate:import", "Import Language files and create a translated duplicte of a master Course.", [
      "_loadTranslateConfig",
      "_loadMasterCourse",
      "_loadLanguageFiles",
      "_updateCourseData",
      "_saveCourseData"
    ]);
    
};
