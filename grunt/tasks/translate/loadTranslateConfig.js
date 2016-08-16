module.exports = function (grunt) {

  grunt.registerTask("_getTranslateConfig", function () {

    // options masterLang, targetLang, format, files, csvDelimiter
    if (grunt.option("masterLang")) {
      grunt.config.set('translate.masterLang', grunt.option('masterLang'));
    }

    if (grunt.option("targetLang")) {
      grunt.config.set('translate.targetLang', grunt.option('targetLang'));
    }

    if (grunt.option("format")) {
      switch (grunt.option("format")) {
        case "raw":
        case "json":
          grunt.config.set('translate.format', 'json');      
          break;
        
        case "csv":
        default:
          grunt.config.set('translate.format', 'csv');
          break;
      }
    }

    if (grunt.option("csvDelimiter")) {
      grunt.config.set('translate.csvDelimiter', grunt.option('csvDelimiter'));
    }

    if (grunt.option("replace")) {
      grunt.config.set('translate.shouldReplaceExisting', true);
    }

  });
  
};
