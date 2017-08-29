/**
* For development
*/
module.exports = function(grunt) {
    grunt.registerTask('diff', 'Differential compile on a developer-friendly build of the course', [
        '_log-vars',
        'check-json',
        'build-config',
        'copy',
        'newer:handlebars:compile',
        'create-json-config',
        'schema-defaults',
        'tracking-insert',
        'newer:javascript:dev',
        'newer:less:dev',
        'replace'
        'scripts:adaptpostbuild'
    ]);
};