/**
* Tasks related to building
*/
module.exports = function(grunt) {
    grunt.registerTask('_build', ['_log-vars','jsonlint', 'check-json', 'copy', 'concat', 'less', 'handlebars', 'bower', 'requirejs-bundle', 'create-json-config', 'schema-defaults', 'tracking-insert']);

    grunt.registerTask('build', 'Creates a production-ready build of the course', ['_build', 'requirejs:compile', 'clean:dist']);

    grunt.registerTask('dev', 'Creates a developer-friendly build of the course', ['_build', 'requirejs:dev', 'watch']);

    grunt.registerTask('server-build', 'Builds the course without JSON [used by the authoring tool]', function(mode) {
        var requireMode = (mode === 'dev') ? 'dev' : 'compile';
        var tasks = ['copy', 'concat', 'less', 'handlebars', 'bower', 'requirejs-bundle', 'requirejs:' + requireMode];
        grunt.task.run(tasks);
    });
}
