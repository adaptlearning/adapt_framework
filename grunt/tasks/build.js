/**
* For production
*/
module.exports = function(grunt) {
    grunt.registerTask('build', 'Creates a production-ready build of the course', [
        '_log-vars',
        'check-json',
        'clean:output',
        'copy',
        'handlebars',
        'create-json-config',
        'schema-defaults',
        'tracking-insert',
        'javascript:compile',
        'clean:dist',
        'less:compile',
        'replace'
    ]);
}
