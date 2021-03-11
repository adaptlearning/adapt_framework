module.exports = function(grunt) {
  const Helpers = require('../helpers')(grunt);
  grunt.registerTask('tracking-remove', 'Removes all tracking IDs', function() {
    const data = Helpers.getFramework().getData();
    data.removeTrackingIds();
  });
};
