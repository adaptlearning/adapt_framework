var _ = require('underscore');
var fs = require('fs');
var path = require('path');

var config = require(path.join('./grunt', 'config.json'));

var appendSlash = function(dir) {
    if (dir) {
        var lastChar = dir.substring(dir.length - 1, dir.length);
        // TODO: check the use of / on windows
        if (lastChar !== '/') return dir + '/';
    }
};

module.exports = function(grunt) {
    require('time-grunt')(grunt);

    var generateConfigData = function() {
        // Selectively load the course.json
        // 'outputdir' will be passed in a call to server-build, i.e. from the authoring tool
        var buildConfigPath = grunt.option('outputdir')
          ? './' + grunt.option('outputdir') + '/course/config.json'
          : './src/course/config.json';
        var buildConfig = require(buildConfigPath).build || {};

        var data = {
            sourcedir: appendSlash(grunt.option('sourcedir')) || 'src/',
            outputdir: appendSlash(grunt.option('outputdir')) || 'build/',
            theme: grunt.option('theme') || '**',
            menu: grunt.option('menu') || '**',
            excludes: buildConfig.excludes
        };

        if(buildConfig.includes) data.includes = getIncludes(buildConfig.includes, data);
    };

    var getIncludes = function(buildIncludes, configData) {
        var defaultIncludes = config.defaultIncludes;

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
                } catch(error) {
                    // some of the children will not be dirs, ignore
                    if(error.code !== 'MODULE_NOT_FOUND') console.log(error);
                }
            }
        }
        return defaultIncludes.concat(buildIncludes, dependencies);
    };

    require('load-grunt-config')(grunt, {
        data: generateConfigData(),
        configPath: path.join(process.cwd(), 'grunt', 'config'),
        jitGrunt: {
            customTasksDir: path.join(process.cwd(), 'grunt', 'tasks'),
            staticMappings: {
                bower: 'grunt-bower-requirejs'
            }
        }
    });

    grunt.config('helpers', require('./grunt/helpers')(grunt));
    grunt.registerTask('default', ['help']);
};
