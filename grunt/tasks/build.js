/**
* For production
*/
module.exports = function(grunt) {
    grunt.registerTask('build', 'Creates a production-ready build of the course', [
        '_log-vars',
        'jsonlint',
        'check-json',
        'clean:output',
        'copy',
        'less:compile',
        'handlebars',
        'bower',
        'requirejs-bundle',
        'create-json-config',
        'schema-defaults',
        'tracking-insert',
        'requirejs:compile',
        'clean:dist'
    ]);
}
