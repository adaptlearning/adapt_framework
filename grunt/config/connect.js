module.exports = function (grunt, options) {

  var port = grunt.option('port') || 9001;
  var host = grunt.option('host') || "localhost";
  
  return {
    server: {
      options: {
        port: port,
        base: '<%= outputdir %>',
        keepalive:true,
        open:true
      }
    },
    spoorOffline: {
      options: {
        port: port,
        base: '<%= outputdir %>',
        keepalive:true,
        path: 'http://'+host+':'+port+'/scorm_test_harness.html'
      }
    }
  }
}
