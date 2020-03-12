module.exports = function(grunt) {
  grunt.registerTask('tracking-reset', 'Resets and re-inserts all tracking IDs, starting with 0', [
    'tracking-remove',
    'tracking-insert'
  ]);
};
