/**
* Tasks for running course on a local server
*/
module.exports = function(grunt) {
    grunt.registerTask('server', 'Runs a local server using port 9001', ['_log-server', 'concurrent:server']);
}
