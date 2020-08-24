module.exports = function(grunt) {

  const Helpers = require('../helpers')(grunt);

  grunt.registerTask('translate', 'Import/export for translations. For more details, please visit https://github.com/adaptlearning/adapt_framework/wiki/Course-Localisation', function(mode) {

    const next = this.async();

    const framework = Helpers.getFramework();
    grunt.log.ok(`Using ${framework.useOutputData ? framework.outputPath : framework.sourcePath} folder for course data...`);

    const translate = framework.getTranslate({
      masterLang: grunt.option('masterLang') || 'en',
      targetLang: grunt.option('targetLang') || null,
      format: grunt.option('format') || 'csv',
      csvDelimiter: grunt.option('csvDelimiter') || null,
      shouldReplaceExisting: grunt.option('replace') || false,
      languagePath: grunt.option('languagedir') || 'languagefiles',
      isTest: grunt.option('test') || false,
      log: grunt.log.ok
    });

    switch (mode) {
      case 'export':
        translate.export().then(next, err => {
          grunt.log.error(err);
          next();
        });
        break;
      case 'import':
        translate.import().then(next, err => {
          switch (err.number) {
            case 10001: // Target language option is missing
              grunt.log.error(err + `\nPlease add --targetLang=<languageCode>`);
              break;
            case 10002: // Import source folder does not exist.
              grunt.log.error(err + `\nPlease create this folder in the languagefiles directory.`);
              break;
            case 10003: // Import destination folder already exists.
              grunt.log.error(err + `\nTo replace the content in this folder, please add a --replace flag to the grunt task.`);
              break;
            case 10014: // Could not detect delimiter
              grunt.log.error(err + `\nTo specify a delimiter, please add a --csvDelimiter=',' flag to the grunt task. Only , ; | tab and space are supported.`);
              break;
            default:
              grunt.log.error(err);
          }
          next();
        });
        break;
    }

  });

};
