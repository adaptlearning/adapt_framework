module.exports = function(grunt) {
  const Helpers = require('../helpers')(grunt);
  grunt.registerTask('check-json', 'Validates the course json, checks for duplicate IDs, and that each element has a parent', function() {
    // validates JSON files
    grunt.task.run('jsonlint');
    grunt.task.run('check-plugins');
    const data = Helpers.getFramework().getData();
    data.checkIds();
  });
};
