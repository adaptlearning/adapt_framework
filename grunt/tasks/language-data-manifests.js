module.exports = function(grunt) {
  const Helpers = require('../helpers')(grunt);
  grunt.registerTask('language-data-manifests', 'Creates a manifest for each set of language data files', function() {
    const languages = Helpers.getFramework({ useOutputData: true }).getData().languages;
    languages.forEach(language => language.saveManifest());
  });
};
