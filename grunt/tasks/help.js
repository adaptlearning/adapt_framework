/*
* Lists out the available tasks along with their descriptions.
* Tasks in the array below will not be listed.
*/
module.exports = function(grunt) {
      grunt.registerTask('help', function() {
          var chalk = require('chalk'); // for some nice colouring
          var columnify = require('columnify'); // deals with formatting
          var config = grunt.config('help') || {
            maxConsoleWidth: '80',
          };

          grunt.log.writeln('');
          grunt.log.writeln(chalk.underline('Adapt Learning automated build process'));
          grunt.log.writeln('');
          grunt.log.writeln('See below for the list of available tasks:');
          grunt.log.writeln('');

          var taskData = {};
          var maxTaskLength = 0;

          // TODO: find way of getting task list with async task loading

          var options = {
              maxWidth: config.maxConsoleWidth - maxTaskLength,
              showHeaders: false,
              columnSplitter: '  '
          };

          // log everything
          grunt.log.writeln(columnify(taskData, options));

          grunt.log.writeln('');
          grunt.log.writeln('Run a task using: grunt [task name]');
          grunt.log.writeln('');
          grunt.log.writeln('For more information, see https://github.com/adaptlearning/adapt_framework/wiki');
      });
  }
