module.exports = function(grunt) {
    var helpers = require('./grunt/helpers')(grunt);

    require('time-grunt')(grunt);
    require('load-grunt-config')(grunt, {
        data: helpers.generateConfigData(),
        configPath: __dirname + '/grunt/config',
        jitGrunt: {
            customTasksDir: __dirname + '/grunt/tasks',
            staticMappings: {
                bower: 'grunt-bower-requirejs'
            }
        }
    });

    grunt.config('helpers', helpers);
    grunt.registerTask('default', ['help']);
};
