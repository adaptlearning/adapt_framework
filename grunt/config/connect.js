module.exports = function(grunt, options) {

  const port = parseInt(grunt.option('port')) || 9001;
  const host = grunt.option('host') || 'localhost';

  return {
    server: {
      options: {
        port,
        base: '<%= outputdir %>',
        keepalive: true,
        open: true
      }
    },
    'server-silent': {
      options: {
        port,
        base: '<%= outputdir %>',
        keepalive: true,
        open: false
      }
    },
    spoorOffline: {
      options: {
        port,
        base: '<%= outputdir %>',
        keepalive: true,
        open: 'http://' + host + ':' + port + '/scorm_test_harness.html'
      }
    }
  };
};
