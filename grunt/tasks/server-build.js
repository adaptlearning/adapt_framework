/**
* For the authoring tool
*/
module.exports = function(grunt) {
    grunt.registerTask('server-build', 'Builds the course without JSON [used by the authoring tool]', function(mode) {
        var requireMode = (mode === 'dev') ? 'dev' : 'compile';

        grunt.task.run([
            '_log-vars',
            'copy',
            'less:' + requireMode,
            'handlebars',
            'javascript:' + requireMode,
            'replace'
        ]);
    });
}
