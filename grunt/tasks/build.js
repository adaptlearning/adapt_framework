/**
 * For production
 */
module.exports = function(grunt) {
  grunt.registerTask('build', 'Creates a production-ready build of the course', [
    '_log-vars',
    'check-json',
    'clean:output',
    'build-config',
    'tracking-insert',
    'copy',
    'scripts:adaptpostcopy',
    'schema-defaults',
    'language-data-manifests',
    'handlebars',
    'javascript:compile',
    'clean:dist',
    'less:compile',
    'replace',
    'scripts:adaptpostbuild',
    'clean:temp',
    'minify'
  ]);
};
