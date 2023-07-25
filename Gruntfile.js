const path = require('path');

module.exports = function(grunt) {
  const helpers = require('./grunt/helpers')(grunt);

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

  grunt.config('helpers', helpers);
  grunt.registerTask('default', ['help']);
};

// guard against ECONNRESET issues https://github.com/adaptlearning/adapt-cli/issues/169
process.on('uncaughtException', (error, origin) => {
  if (error?.code === 'ECONNRESET') return;
  console.error('UNCAUGHT EXCEPTION');
  console.error(error);
  console.error(origin);
});
