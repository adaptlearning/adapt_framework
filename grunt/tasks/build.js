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
    'tracking-insert',
    'javascript:compile',
    'babel',
    'clean:dist',
    'less:compile',
    'replace',
    'scripts:adaptpostbuild',
    'clean:temp',
    'minify'
  ]);
};
