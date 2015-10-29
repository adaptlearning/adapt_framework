/*
* Lists out the available tasks along with their descriptions.
* Tasks in the array below will not be listed.
*/
module.exports = function(grunt) {
      grunt.registerTask('help', function() {
          var chalk = require('chalk'); // for some nice colouring
          var columnify = require('columnify'); // deals with formatting
          var config = grunt.config('help');

          grunt.log.writeln('');
          grunt.log.writeln(chalk.underline('Adapt Learning automated build process'));
          grunt.log.writeln('');
          grunt.log.writeln('See below for the list of available tasks:');
          grunt.log.writeln('');

          var taskData = {};
          var maxTaskLength = 0;

          // TODO: find alternate way of getting task list

          for(var key in grunt.task._tasks) {
              if(this.name !== key && -1 === config.ignoredTasks.indexOf(key)) {
                  var task = grunt.task._tasks[key];
                  taskData[chalk.cyan(task.name)] = task.info;
                  if(task.name.length > maxTaskLength) maxTaskLength = task.name.length
              }
          }

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
