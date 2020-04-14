/**
 * For development
 */
module.exports = function(grunt) {
  grunt.registerTask('dev', 'Creates a developer-friendly build of the course', [
    '_log-vars',
    'check-json',
    'build-config',
    'copy',
    'schema-defaults',
    'language-data-manifests',
    'handlebars',
    'tracking-insert',
    'javascript:dev',
    'babel:dev',
    'less:dev',
    'replace',
    'scripts:adaptpostbuild',
    'clean:temp',
    'watch'
  ]);
};
