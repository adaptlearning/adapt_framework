/**
 * For production
 */
module.exports = function(grunt) {
  grunt.registerTask('build', 'Creates a production-ready build of the course', [
    '_log-vars',
    'check-json',
    'clean:output',
    'build-config',
    'copy',
    'schema-defaults',
    'handlebars',
    'create-json-config',
    'tracking-insert',
    'javascript:compile',
    'clean:dist',
    'less:compile',
    'replace',
    'scripts:adaptpostbuild',
    'minify'
  ]);
};
