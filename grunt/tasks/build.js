/**
* For production
*/
module.exports = function(grunt) {
    grunt.registerTask('build', 'Creates a production-ready build of the course', function() {
        var tasks;

        if (grunt.option("newer")) {
            tasks = [
                '_log-vars',
                'check-json',
                'copy',
                'handlebars',
                'create-json-config',
                'schema-defaults',
                'tracking-insert',
                'newer:javascript:compile',
                'clean:dist',
                'less:compile',
                'replace'
            ];
        } else {
            tasks = [
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
            ];  
        };

        grunt.task.run(tasks);
    });
}
