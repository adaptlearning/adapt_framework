var _ = require('underscore');
var fs = require('fs');
var path = require('path');

var defaults = {
    gruntConfigDir: __dirname + '/grunt/config',
    gruntTasksDir: __dirname + '/grunt/tasks',
    sourcedir: 'src/',
    outputdir: 'build/',
    theme: '**',
    menu: '**',
    includes: [
        "src/core/",
        "templates/templates.js",
        "components/components.js",
        "extensions/extensions.js",
        "menu/menu.js",
        "theme/theme.js"
    ]
};

var MOD_NOT_FOUND = 'MODULE_NOT_FOUND';

module.exports = function(grunt) {
    require('time-grunt')(grunt);

    var generateConfigData = function() {
        var data = {
            sourcedir: appendSlash(grunt.option('sourcedir')) || defaults.sourcedir,
            outputdir: appendSlash(grunt.option('outputdir')) || defaults.outputdir,
            theme: grunt.option('theme') || defaults.theme,
            menu: grunt.option('menu') || defaults.menu,
        };

        // Selectively load the course.json ('outputdir' passed by server-build)
        var prefix = grunt.option('outputdir') ? grunt.option('outputdir') : data.sourcedir;
        var buildConfigPath = './' + prefix + 'course/config.json';
        try {
            var buildConfig = require(buildConfigPath).build || {};
        }
        catch(error) {
            console.log(error);
        }

        if(buildConfig.includes) data.includes = getIncludes(buildConfig.includes, data);
        if(buildConfig.excludes) data.excludes = buildConfig.excludes
    };

    var appendSlash = function(dir) {
        if (dir) {
            var lastChar = dir.substring(dir.length - 1, dir.length);
            // TODO: check the use of / on windows
            if (lastChar !== '/') return dir + '/';
        }
    };

    var getIncludes = function(buildIncludes, configData) {
        var pluginTypes = [ 'components', 'extensions', 'menu', 'theme' ];
        var dependencies = [];

        for(var i = 0, count = pluginTypes.length; i < count; i++) {
            var dir = path.join(__dirname, configData.sourcedir, pluginTypes[i]);
            var children = fs.readdirSync(dir);
            for(var j = 0, count = children.length; j < count; j++) {
                try {
                    var bowerJson = require(path.join(dir, children[j], 'bower.json'));
                    for (var key in bowerJson.dependencies) {
                        if(!_.contains(buildIncludes, key)) dependencies.push(key)
                    }
                } catch(error) { // ignore 'dir doesn't exist errors'
                    if(error.code !== MOD_NOT_FOUND) console.log(error);
                }
            }
        }
        return [].concat(defaults.includes, buildIncludes, dependencies);
    };

    /**
    * Main entry point
    */
    require('load-grunt-config')(grunt, {
        data: generateConfigData(),
        configPath: defaults.gruntConfigDir,
        jitGrunt: {
            customTasksDir: defaults.gruntTasksDir,
            staticMappings: {
                bower: 'grunt-bower-requirejs'
            }
        }
    });

    grunt.config('helpers', require('./grunt/helpers')(grunt));
    grunt.registerTask('default', ['help']);
};
