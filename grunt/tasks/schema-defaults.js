module.exports = function(grunt) {
  const Helpers = require('../helpers')(grunt);
  grunt.registerTask('schema-defaults', 'Manufactures the course.json _globals defaults', function() {
    const framework = Helpers.getFramework({ useOutputData: true });
    framework.applyGlobalsDefaults();
  });
};
