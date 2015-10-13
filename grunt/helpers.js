module.exports = function(grunt) {
    // tasks
    grunt.registerTask('_log-server', 'Logs out user-defined build variables', function() {
        grunt.log.ok('Starting server in "' + grunt.config('outputdir') + '" using port ' + grunt.config('connect.server.options.port'));
    });
    grunt.registerTask('_log-vars', 'Logs out user-defined build variables', function() {
        grunt.log.writeln('The following plugins will be excluded from the build:');
        grunt.log.writeln(grunt.config('excludes').toString());
        grunt.log.writeln('');

        grunt.log.ok('Using source at "' + grunt.config('sourcedir') + '"');
        grunt.log.ok('Building to "' + grunt.config('outputdir') + '"');
        if (grunt.config('theme') !== '**') grunt.log.ok('Using theme "' + grunt.config('theme') + '"');
        if (grunt.config('menu') !== '**') grunt.log.ok('Using menu "' + grunt.config('menu') + '"');
    });

    var generateExcludedRegExp = function() {
        var excludes = grunt.config('excludes');
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

    exports.isPluginExcluded = function(pluginPath) {
        var excludes = grunt.config('excludes');
        if(!excludes) return false;

        for(var i = 0, count = excludes.length; i < count; i++) {
            if(pluginPath.search(exports.excludedRegExp) !== -1) {
                grunt.log.writeln('Excluding', pluginPath);
                return true;
            }
        }
        return false;
    };

    exports.excludedFilter = function(filepath) {
        return !exports.isPluginExcluded(filepath);
    };

    exports.excludedProcess = function(content, filepath) {
        if(exports.isPluginExcluded(filepath)) return "";
        else return content;
    };

    exports.excludedRegExp = generateExcludedRegExp();

    return exports;
};
