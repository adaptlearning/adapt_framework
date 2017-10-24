/**
* For development
*/
module.exports = function(grunt) {
    grunt.registerTask('dev', 'Creates a developer-friendly build of the course', [
        '_log-vars',
        'check-json',
        'build-config',
        'schema-defaults',
        'copy',
        'handlebars',
        'create-json-config',
        'tracking-insert',
        'javascript:dev',
        'less:dev',
        'replace',
        'scripts:adaptpostbuild',
        'watch'
    ]);
};