var chalk = require('chalk');
module.exports = function(grunt) {
    // tasks
    grunt.registerTask('_log-server', 'Logs out user-defined build variables', function() {
        grunt.log.ok('Starting server in "' + grunt.config('outputdir') + '" using port ' + grunt.config('connect.server.options.port'));
    });
    grunt.registerTask('_log-vars', 'Logs out user-defined build variables', function() {
        var includes = grunt.config('includes');
        var excludes = grunt.config('excludes');

        if (includes && excludes) {
            grunt.fail.fatal('Cannot specify includes and excludes. Please check your config.json configuration.');
        }

        if (includes) {
            grunt.log.writeln('The following plugins will be included in the build:');
            for(var i = 0, count = includes.length; i < count; i++)
                grunt.log.writeln('- ' + includes[i]);
            grunt.log.writeln('');
        }
        if (excludes) {
            grunt.log.writeln('The following plugins will be excluded from the build:');
            for(var i = 0, count = excludes.length; i < count; i++)
                grunt.log.writeln('- ' + excludes[i]);
            grunt.log.writeln('');
        }

        grunt.log.ok('Using source at "' + grunt.config('sourcedir') + '"');
        grunt.log.ok('Building to "' + grunt.config('outputdir') + '"');
        if (grunt.config('theme') !== '**') grunt.log.ok('Using theme "' + grunt.config('theme') + '"');
        if (grunt.config('menu') !== '**') grunt.log.ok('Using menu "' + grunt.config('menu') + '"');
    });

    var generateIncludedRegExp = function() {
        var includes = grunt.config('includes') || [];
        var re = '';
        for(var i = 0, count = includes.length; i < count; i++) {
            re += includes[i];
            if(i < includes.length-1) re += '|';
        }
        return new RegExp(re);
    };

    var generateExcludedRegExp = function() {
        var excludes = grunt.config('excludes') || [];
        var re = '';
        for(var i = 0, count = excludes.length; i < count; i++) {
            re += excludes[i];
            if(i < excludes.length-1) re += '|';
        }
        return new RegExp(re);
    };

    var exports = {};

    /*
    * Uses the parent folder name (menu, theme, components, extensions).
    * Also caches a list of the installed plugins
    * assumption: all folders are plugins
    */
    exports.getInstalledPluginsByType = function(type) {
        var pluginDir = grunt.config('sourcedir') + type + '/';
        if(!grunt.file.isDir(pluginDir)) return []; // fail silently
        // return all sub-folders, and save for later
        return grunt.option(type, grunt.file.expand({ filter:'isDirectory', cwd:pluginDir }, '*'));
    };

    exports.isPluginInstalled = function(pluginName) {
        var types = ['components','extensions','theme','menu'];
        for(var i = 0, len = types.length; i < len; i++) {
            var plugins = grunt.option(types[i]) || this.getInstalledPluginsByType(types[i]);
            if(plugins.indexOf(pluginName) !== -1) return true;
        }
        return false;
    };

    exports.isPluginIncluded = function(pluginPath) {
        var includes = grunt.config('includes');
        var excludes = grunt.config('excludes');

        // carry on as normal if no includes/excludes
        if (!includes && !excludes) return true;

        var isIncluded = includes && pluginPath.search(exports.includedRegExp) !== -1;
        var isExcluded = excludes && pluginPath.search(exports.excludedRegExp) !== -1;

        if (isExcluded || !isIncluded) {
//            grunt.log.writeln('Excluded ' + chalk.magenta(pluginPath));
            return false;
        }
        else {
          // grunt.log.writeln('Included ' + chalk.green(pluginPath));
          return true;
        }
    };

    exports.includedFilter = function(filepath) {
        return exports.isPluginIncluded(filepath);
    };

    exports.includedProcess = function(content, filepath) {
        if(!exports.isPluginIncluded(filepath)) return "";
        else return content;
    };

    exports.includedRegExp = generateIncludedRegExp();
    exports.excludedRegExp = generateExcludedRegExp();

    return exports;
};
