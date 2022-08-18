const path = require('path');

module.exports = function(grunt) {
  const helpers = require('./grunt/helpers')(grunt);
  grunt.option('helpers', helpers);
  require('time-grunt')(grunt);
  require('load-grunt-config')(grunt, {
    data: helpers.generateConfigData(),
    configPath: path.join(__dirname, 'grunt', 'config'),
    jitGrunt: {
      customTasksDir: path.join(__dirname, 'grunt', 'tasks'),
      staticMappings: {
        bower: 'grunt-bower-requirejs'
      }
    }
  });
  grunt.registerTask('default', ['help']);
};
