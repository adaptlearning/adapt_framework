module.exports = function(grunt) {
    var path = require('path');
    var Helpers = require('./grunt/helpers')(grunt);

    require('load-grunt-config')(grunt, {
        configPath: path.join(process.cwd(), 'grunt', 'config'),
        data: {
            sourcedir: Helpers.getSourceDir(),
            outputdir: Helpers.getOutputDir(),
            theme: grunt.option('theme') || '**',
            menu: grunt.option('menu') || '**',
            pkg: grunt.file.readJSON('package.json'),
        }
    });

    // load the external tasks
    grunt.loadTasks('grunt/tasks');
    grunt.loadNpmTasks('adapt-grunt-tracking-ids');

    grunt.registerTask('_build', ['_log-vars','jsonlint', 'check-json', 'copy', 'concat', 'less', 'handlebars', 'bower', 'requirejs-bundle', 'create-json-config', 'schema-defaults', 'tracking-insert']);
    grunt.registerTask('build', 'Creates a production-ready build of the course', ['_build', 'requirejs:compile', 'clean:dist']);
    grunt.registerTask('dev', 'Creates a developer-friendly build of the course', ['_build', 'requirejs:dev', 'watch']);
    grunt.registerTask('server-build', 'Builds the course without JSON [used by the authoring tool]', function(mode) {
        var requireMode = (mode === 'dev') ? 'dev' : 'compile';
        var tasks = ['copy', 'concat', 'less', 'handlebars', 'bower', 'requirejs-bundle', 'requirejs:' + requireMode];
        grunt.task.run(tasks);
    });

    grunt.registerTask('server', 'Runs a local server using port 9001', ['_log-server', 'concurrent:server']);
    grunt.registerTask('server-scorm', 'Runs a SCORM test server using port 9001', ['_log-server', 'concurrent:spoor']);

    grunt.registerTask('tracking-insert', 'Adds any missing tracking IDs (starting at the highest existing ID)', function() {
        if(Helpers.isPluginInstalled('adapt-contrib-spoor')) grunt.task.run(['adapt_insert_tracking_ids']);
    });
    grunt.registerTask('tracking-remove', 'Removes all tracking IDs', function() {
        if(Helpers.isPluginInstalled('adapt-contrib-spoor')) grunt.task.run(['adapt_remove_tracking_ids']);
    });
    grunt.registerTask('tracking-reset', 'Resets and re-inserts all tracking IDs, starting with 0', function() {
        if(Helpers.isPluginInstalled('adapt-contrib-spoor')) grunt.task.run(['adapt_reset_tracking_ids']);
    });

    grunt.registerTask('default', ['help']);
};
