module.exports = function (grunt) {

  grunt.registerTask("_loadTranslateConfig", function () {

    var adaptConfig = grunt.file.readJSON("adapt.json");

    // options masterLang, targetLang, format, files, csvDelimiter
    if (grunt.option("masterLang")) {
      grunt.config.set('translate.masterLang', grunt.option('masterLang'));
    }

    if (grunt.option("targetLang")) {
      grunt.config.set('translate.targetLang', grunt.option('targetLang'));
    }

    if (grunt.option("format")) {
      switch (grunt.option("format")) {
        case "csv":
          grunt.config.set('translate.format', 'csv');
          break;
        
        case "json":
        default:
          grunt.config.set('translate.format', 'json');      
          break;
      }
    }

    if (grunt.option("csvDelimiter")) {
      grunt.config.set('translate.csvDelimiter', grunt.option('csvDelimiter'));
    }

  });
  
};
