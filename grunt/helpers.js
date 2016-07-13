var _ = require('underscore');
var chalk = require('chalk');
var fs = require('fs');
var path = require('path');

module.exports = function(grunt) {

    var convertSlashes = /\\/g;

    // grunt tasks

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
            grunt.log.writeln('The following will be included in the build:');
            for(var i = 0, count = includes.length; i < count; i++)
                grunt.log.writeln('- ' + includes[i]);
            grunt.log.writeln('');
        }
        if (excludes) {
            grunt.log.writeln('The following will be excluded from the build:');
            for(var i = 0, count = excludes.length; i < count; i++)
                grunt.log.writeln('- ' + excludes[i]);
            grunt.log.writeln('');
        }

        grunt.log.ok('Using source at "' + grunt.config('sourcedir') + '"');
        grunt.log.ok('Building to "' + grunt.config('outputdir') + '"');
        if (grunt.config('theme') !== '**') grunt.log.ok('Using theme "' + grunt.config('theme') + '"');
        if (grunt.config('menu') !== '**') grunt.log.ok('Using menu "' + grunt.config('menu') + '"');
        if (grunt.config('languages') !== '**') grunt.log.ok('The following languages will be included in the build "' + grunt.config('languages') + '"');
    });

    // privates

    var generateIncludedRegExp = function() {
        var includes = grunt.config('includes') || [];
        var re = '';
        for(var i = 0, count = includes.length; i < count; i++) {
            re += '\/' + includes[i].toLowerCase() + '\/';
            if(i < includes.length-1) re += '|';
        }
        return new RegExp(re, "i");
    };

    var generateExcludedRegExp = function() {
        var excludes = grunt.config('excludes') || [];
        var re = '';
        for(var i = 0, count = excludes.length; i < count; i++) {
            re += '\/' + excludes[i].toLowerCase() + '\/';
            if(i < excludes.length-1) re += '|';
        }
        return new RegExp(re, "i");
    };

    var appendSlash = function(dir) {
        if (dir) {
            var lastChar = dir.substring(dir.length - 1, dir.length);
            if (lastChar !== path.sep) return dir + path.sep;
        }
    };

    // exported

    var exports = {};

    exports.defaults = {
        sourcedir: process.cwd() + path.sep + 'src' + path.sep,
        outputdir: process.cwd() + path.sep + 'build' + path.sep,
        theme: '**',
        menu: '**',
        languages: '**',
        includes: [

        ],
        pluginTypes: [
            'components',
            'extensions',
            'menu',
            'theme'
        ]
    };

    exports.getIncludes = function(buildIncludes, configData) {
        var dependencies = [];

        // Iterate over the plugin types.
        for (var i = 0; i < exports.defaults.pluginTypes.length; i++) {
            var pluginTypeDir = path.join(configData.sourcedir, exports.defaults.pluginTypes[i]);
            // grab a list of the installed (and included) plugins for this type
            var plugins = _.intersection(fs.readdirSync(pluginTypeDir),buildIncludes);
            for (var j = 0; j < plugins.length; j++) {
                try {
                    var bowerJson = require(path.join(pluginTypeDir, plugins[j], 'bower.json'));

                    for (var key in bowerJson.dependencies) {
                        if (!_.contains(buildIncludes, key)) dependencies.push(key);
                    }
                } catch(error) {
                    grunt.log.error(error);
                }
            }
        }

        return [].concat(exports.defaults.includes, buildIncludes, dependencies);
    };

    exports.generateConfigData = function() {

        var languageFolders = "";
        if (grunt.option('languages') && grunt.option('languages').split(',').length > 1) {
          languageFolders = "{" + grunt.option('languages') + "}";
        } else {
          languageFolders = grunt.option('languages');
        }

        var data = {
            root: __dirname.split(path.sep).slice(0,-1).join(path.sep),
            sourcedir: appendSlash(grunt.option('sourcedir')) || exports.defaults.sourcedir,
            outputdir: appendSlash(grunt.option('outputdir')) || exports.defaults.outputdir,
            theme: grunt.option('theme') || exports.defaults.theme,
            menu: grunt.option('menu') || exports.defaults.menu,
            languages: languageFolders || exports.defaults.languages
        };

        // Selectively load the course.json ('outputdir' passed by server-build)
        var outputdir = grunt.option('outputdir') ? data.outputdir : data.sourcedir;
        // add root path if necessary, and point to course/config.json
        var configPath = path.join(path.resolve(data.root, outputdir), 'course', 'config.json');

        try {
            var buildConfig = require(configPath).build;
        }
        catch(error) {
            return grunt.log.error(error);
        }

        if(buildConfig) {
            if(buildConfig.includes) data.includes = exports.getIncludes(buildConfig.includes, data);
            if(buildConfig.excludes) data.excludes = buildConfig.excludes;
        }

        return data;
    };

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
        pluginPath = pluginPath.replace(convertSlashes, "/");

        var includes = grunt.config('includes');
        var excludes = grunt.config('excludes');

        // carry on as normal if no includes/excludes
        if (!includes && !excludes) return true;

        var isIncluded = includes && pluginPath.search(exports.getIncludedRegExp()) !== -1;
        var isExcluded = excludes && pluginPath.search(exports.getExcludedRegExp()) !== -1;

        if (isExcluded || isIncluded === false) {
            // grunt.log.writeln('Excluded ' + chalk.red(pluginPath));
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

    exports.getIncludedRegExp = function() {
        var configValue = grunt.config('includedRegExp');
        return configValue || grunt.config('includedRegExp', generateIncludedRegExp());
    };

    exports.getExcludedRegExp = function() {
        var configValue = grunt.config('excludedRegExp');
        return configValue || grunt.config('excludedRegExp', generateExcludedRegExp());
    };

    return exports;
};
