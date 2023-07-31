const fs = require('fs');
const path = require('path');
/*
 * Lists out the available tasks along with their descriptions.
 * Tasks in the array below will not be listed.
 */
module.exports = function(grunt) {
  grunt.registerTask('help', function() {
    const chalk = require('chalk'); // for some nice colouring
    const columnify = require('columnify'); // deals with formatting
    const config = grunt.config('help') || {
      maxConsoleWidth: '80'
    };

    grunt.log.writeln('');
    grunt.log.writeln(chalk.underline('Adapt Learning automated build process'));
    grunt.log.writeln('');
    grunt.log.writeln('See below for the list of available tasks:');
    grunt.log.writeln('');

    let maxTaskLength = 0;
    const taskData = getTaskData();

    for (const task in taskData) {
      if (task.length > maxTaskLength) maxTaskLength = task.length;
    }

    const options = {
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
};

// TODO: this only includes tasks in /tasks...might not be good enough
function getTaskData() {
  const taskData = {};
  const files = fs.readdirSync(__dirname);
  const re = /grunt.register(Multi)?Task\('(.+?)', '(.*?)',/g;

  for (let i = 0, count = files.length; i < count; i++) {
    // reset RegExp
    re.lastIndex = 0;

    const filePath = path.join(__dirname, files[i]);
    const fileStat = fs.statSync(filePath);

    // skip directories
    if (fileStat.isDirectory()) continue;

    const file = fs.readFileSync(filePath, 'utf8');
    let match = '';
    while ((match = re.exec(file))) {
      taskData[match[2]] = match[3] || '';
    }

  }
  return taskData;
}
