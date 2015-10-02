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

    grunt.registerTask('default', ['help']);
};
