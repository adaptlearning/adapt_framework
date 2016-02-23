module.exports = function (grunt, options) {

  var host = grunt.option('host') || "localhost";

  return {
    server: {
      path: 'http://'+host+':<%= connect.server.options.port %>/'
    },
    spoor: {
      path: 'http://'+host+':<%= connect.server.options.port %>/scorm_test_harness.html'
    }
  }

}
