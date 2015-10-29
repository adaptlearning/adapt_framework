/**
* For development
*/
module.exports = function(grunt) {
    grunt.registerTask('dev', 'Creates a developer-friendly build of the course', [
        '_log-vars',
        'jsonlint',
        'check-json',
        'copy',
        'concat',
        'less',
        'handlebars',
        'bower',
        'requirejs-bundle',
        'create-json-config',
        'schema-defaults',
        'tracking-insert',
        'requirejs:dev',
        'watch'
    ]);
}
