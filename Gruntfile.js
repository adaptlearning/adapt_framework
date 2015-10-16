var path = require('path');

// TODO: check this on windows
var appendSlash = function(dir) {
    if (dir) {
        var lastChar = dir.substring(dir.length - 1, dir.length);
        if (lastChar !== '/') return dir + '/';
    }
};

module.exports = function(grunt) {
    require('time-grunt')(grunt);

    var defaultIncludes = [
        'src/core/',
        'templates/templates.js',
        'components/components.js',
        'extensions/extensions.js',
        'menu/menu.js',
        'theme/theme.js'
    ];
   
    // Selectively load the course.json 
    // 'outputdir' will be passed in a call to server-build, i.e. from the authoring tool
    var buildConfigPath = grunt.option('outputdir') 
      ? './' + grunt.option('outputdir') + '/course/config.json'
      : './src/course/config.json';
    var buildConfig = require(buildConfigPath).build || {};

    require('load-grunt-config')(grunt, {
        data: {
            includes: buildConfig.includes ? defaultIncludes.concat(buildConfig.includes) : undefined,
            excludes: buildConfig.excludes,
            sourcedir: appendSlash(grunt.option('sourcedir')) || 'src/',
            outputdir: appendSlash(grunt.option('outputdir')) || 'build/',
            theme: grunt.option('theme') || '**',
            menu: grunt.option('menu') || '**'
        },
        configPath: path.join(process.cwd(), 'grunt', 'config'),
        jitGrunt: {
            customTasksDir: path.join(process.cwd(), 'grunt', 'tasks'),
            staticMappings: {
                bower: 'grunt-bower-requirejs'
            }
        },
    });

    grunt.config('helpers', require('./grunt/helpers')(grunt));

    grunt.registerTask('default', ['help']);
};
