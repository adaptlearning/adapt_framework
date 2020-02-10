/**
 * For the authoring tool
 */
module.exports = function(grunt) {
  grunt.registerTask('server-build', 'Builds the course without JSON [used by the authoring tool]', function(mode, diff) {

    var requireMode = (mode === 'dev') ? ':dev' : ':compile';
    var newer = diff ? 'newer:' : '';

    grunt.task.run([
      '_log-vars',
      'build-config',
      'copy',
      `${newer}less${requireMode}`,
      `${newer}handlebars`,
      `${newer}javascript${requireMode}`,
      'replace',
      'scripts:adaptpostbuild'
    ]);

  });
};
