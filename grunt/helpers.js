module.exports = function(grunt) {
    var exports = {};
    /*
    * Uses the parent folder name (menu, theme, components, extensions).
    * Also caches a list of the installed plugins
    * assumption: all folders are plugins
    */
    exports.getInstalledPluginsByType = function(type) {
        var pluginDir = grunt.config.get('sourcedir') + type + '/';
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

    exports.isPluginExcluded = function(pluginType, pluginPath) {
        var optionVal = grunt.option(pluginType);
        var isExcluded = optionVal && pluginPath.indexOf(optionVal) === -1;
        return isExcluded;
    },

    exports.getSourceDir = function() {
        var sourcedir = appendSlash(grunt.option('sourcedir')) || 'src/';
        return sourcedir;
    };

    exports.getOutputDir = function() {
        var outputdir = appendSlash(grunt.option('outputdir')) || 'build/';
        return outputdir;
    };

    return exports;
}

// TODO: check this on windows
var appendSlash = function(dir) {
    if (dir) {
        var lastChar = dir.substring(dir.length - 1, dir.length);
        if (lastChar !== '/') return dir + '/';
    }
};
