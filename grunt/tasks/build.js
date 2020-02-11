/**
 * For production
 */
module.exports = function(grunt) {
  grunt.registerTask('build', 'Creates a production-ready build of the course', function(diff) {
    newer = diff ? 'newer:' : '';
    diff = diff ? ':diff' : '';
    grunt.task.run([
      'check-json',
      diff?null:'clean:output',
      'schema-defaults',
      'create-json-config',
      'tracking-insert',
      `server-build:compile${diff}`,
      diff?null:'clean:dist',
      'json-minify',
      `${newer}uglify`
    ].filter(Boolean));
  });

};
