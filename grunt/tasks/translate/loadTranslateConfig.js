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
      grunt.config.set('translate.format', grunt.option('format'));
    }
    
    if (grunt.option("csvDelimiter")) {
      grunt.config.set('translate.csvDelimiter', grunt.option('csvDelimiter'));
    }
    
    if (grunt.option("files")) {
      grunt.config.set('translate.langFiles', grunt.option('files'));
    }
    
    // check config in adapt.json
    
    if (adaptConfig.hasOwnProperty("translate")) {
      // masterLanguage
      if (!grunt.option('masterLang') && adaptConfig.translate.hasOwnProperty("masterLanguage")) {
        if (adaptConfig.translate.masterLanguage) {
          grunt.config.set("translate.masterLang", adaptConfig.translate.masterLanguage);
        }
      }
    
      // csvDelimiter
      if (!grunt.option('csvDelimiter') && adaptConfig.translate.hasOwnProperty("csvDelimiter")) {
        if (adaptConfig.translate.csvDelimiter) {
          grunt.config.set("translate.csvDelimiter", adaptConfig.translate.csvDelimiter);
        }
      }
    
      // language fiels
      if (!grunt.option('files') && adaptConfig.translate.hasOwnProperty("files")) {
        if ( adaptConfig.translate.files[grunt.config("translate.targetLang")] ) {
          grunt.config.set("translate.langFiles", adaptConfig.translate.files[grunt.config("translate.targetLang")]);
        }
      }
    }
  });
  
};
