module.exports = function(grunt) {
    /*
      * Lists out the available tasks along with their descriptions.
      * Tasks in the array below will not be listed.
      */
      grunt.registerTask('help', function() {
          var chalk = require('chalk'); // for some nice colouring
          var columnify = require('columnify'); // deals with formatting

          // the following tasks won't be shown
          var ignoredTasks = [
              'default',
              'bower',
              'concurrent',
              'clean',
              'connect',
              'copy',
              'handlebars',
              'less',
              'requirejs',
              'watch',
              'jsonlint',
              'open',
              'requirejs-bundle',
              'concat',
              'create-json-config',
              'check-json',
              '_log-vars',
              '_log-server',
              '_build',
              'server-build',
              'adapt_insert_tracking_ids',
              'adapt_remove_tracking_ids',
              'adapt_reset_tracking_ids',
              'schema-defaults'
          ];

          grunt.log.writeln('');
          grunt.log.writeln(chalk.underline('Adapt Learning automated build process'));
          grunt.log.writeln('');
          grunt.log.writeln('See below for the list of available tasks:');
          grunt.log.writeln('');

          var taskData = {};
          var maxTaskLength = 0;
          var maxConsoleWidth = 75; // standard 80 chars + a buffer

          for(var key in grunt.task._tasks) {
              if(this.name !== key && -1 === ignoredTasks.indexOf(key)) {
                  var task = grunt.task._tasks[key];
                  taskData[chalk.cyan(task.name)] = task.info;
                  if(task.name.length > maxTaskLength) maxTaskLength = task.name.length
              }
          }

          var options = {
              maxWidth: maxConsoleWidth - maxTaskLength,
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
