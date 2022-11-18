/**
 * For development
 */
module.exports = function(grunt) {
  grunt.registerTask('dev', 'Creates a developer-friendly build of the course', [
    '_log-vars',
    'check-json',
    'build-config',
    'tracking-insert',
    'copy',
    'scripts:adaptpostcopy',
    'schema-defaults',
    'language-data-manifests',
    'handlebars',
    'javascript:dev',
    'less:dev',
    'replace',
    'scripts:adaptpostbuild',
    'clean:temp',
    'watch'
  ]);
};
