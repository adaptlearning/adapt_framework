module.exports = function(grunt) {
  grunt.registerTask('_log-server', 'Logs out user-defined build variables', function() {
    grunt.log.ok(`Starting server in '${grunt.config('outputdir')}' using port ${grunt.config('connect.server.options.port')}`);
  });
};
