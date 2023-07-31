/**
 * For the authoring tool
 */
module.exports = function(grunt) {
  grunt.registerTask('server-build', 'Builds the course without JSON [used by the authoring tool]', function(mode) {
    const requireMode = (mode === 'dev') ? 'dev' : 'compile';

    grunt.task.run([
      '_log-vars',
      'build-config',
      'copy',
      'scripts:adaptpostcopy',
      'schema-defaults',
      'language-data-manifests',
      'less:' + requireMode,
      'handlebars',
      'javascript:' + requireMode,
      'replace',
      'scripts:adaptpostbuild',
      'clean:temp'
    ]);
  });
};
