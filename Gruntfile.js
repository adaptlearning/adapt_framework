module.exports = function(grunt) {
    var path = require('path');
    var Helpers = require('./grunt/helpers')(grunt);

    require('load-grunt-config')(grunt, {
        configPath: path.join(process.cwd(), 'grunt', 'config'),
        jitGrunt: {
            customTasksDir: path.join(process.cwd(), 'grunt', 'tasks'),
            staticMappings: {
                bower: 'grunt-bower-requirejs'
            }
        },
        data: {
            sourcedir: Helpers.getSourceDir(),
            outputdir: Helpers.getOutputDir(),
            theme: grunt.option('theme') || '**',
            menu: grunt.option('menu') || '**',
            pkg: grunt.file.readJSON('package.json')
        }
    });

    // load the external tasks
    // grunt.loadTasks('grunt/tasks');

    // TODO fix above
    // grunt.loadNpmTasks('grunt-bower-requirejs');

    grunt.registerTask('default', ['help']);
};
