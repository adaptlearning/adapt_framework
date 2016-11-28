var fs = require('fs');
var path = require('path');
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

        var maxTaskLength = 0;
        var taskData = getTaskData();

        for(var task in taskData) {
            if(task.length > maxTaskLength) maxTaskLength = task.length;
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

// TODO: this only includes tasks in /tasks...might not be good enough
function getTaskData() {
    var taskData = {};
    var files = fs.readdirSync(__dirname);
    var re = new RegExp(/grunt.register(Multi)?Task\('(.+?)', '(.*?)',/);

    for(var i = 0, count = files.length; i < count; i++) {
        
        var filePath = path.join(__dirname, files[i]);
        var fileStat = fs.statSync(filePath);
        
        //skip directories
        if (fileStat.isDirectory()) continue;
        
        var file = fs.readFileSync(filePath, 'utf8');
        var match = file.match(re);
        if(match) taskData[match[2]] = match[3] || '';
        
    }
    return taskData;
}

