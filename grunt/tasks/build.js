/**
 * For production
 */
module.exports = function(grunt) {
  grunt.registerTask('build', 'Creates a production-ready build of the course', function(diff) {
    diff = diff ? ":diff" : '';
    grunt.task.run([
      'check-json',
      'clean:output',
      'json-prettify',
      'schema-defaults',
      'create-json-config',
      'tracking-insert',
      `server-build:compile${diff}`,
      'clean:dist',
      'minify'
    ]);
  });

};
