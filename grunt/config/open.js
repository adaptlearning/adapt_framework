module.exports = {
    server: {
        path: 'http://localhost:<%= connect.server.options.port %>/'
    },
    spoor: {
        path: 'http://localhost:<%= connect.server.options.port %>/scorm_test_harness.html'
    }
}
