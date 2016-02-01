module.exports = function (grunt, options) {
    return {
        dev: {
            options: {
                name: 'core/js/app',
                baseUrl: '<%= sourcedir %>',
                mainConfigFile: './config.js',
                out: '<%= outputdir %>adapt/js/adapt.min.js',
                //fetch these bower plugins an add them as dependencies to the app.js
                plugins: [
                    '<%= sourcedir %>components/*/bower.json',
                    '<%= sourcedir %>extensions/*/bower.json',
                    '<%= sourcedir %>menu/<%= menu %>/bower.json',
                    '<%= sourcedir %>theme/<%= theme %>/bower.json'
                ],
                pluginsPath: '<%= sourcedir %>plugins.js',
                pluginsModule: 'plugins',
                //translate old style bundle references into something that does exist
                map: {
                    "*": {
                        "components/components": "plugins",
                        "extensions/extensions": "plugins",
                        "menu/menu": "plugins",
                        "theme/theme": "plugins"
                    }
                },
                
                paths: {
                    "components/components": "plugins",
                    "extensions/extensions": "plugins",
                    "menu/menu": "plugins",
                    "theme/theme": "plugins"
                },
                generateSourceMaps: true,
                preserveLicenseComments:false,
                optimize: 'none',
                onBuildRead: function(moduleName, path, contents) {
                    var isIncludedInBuild = grunt.config('helpers').includedFilter( path );

                    var includes = [
                        "src/core",
                        "plugins"
                    ];

                    var re = '';
                    for(var i = 0, count = includes.length; i < count; i++) {
                        re += includes[i];
                        if(i < includes.length-1) re += '|';
                    }
                    var isIncludedByTask = (new RegExp(re, "i")).test( path );

                    if (!isIncludedByTask && !isIncludedInBuild) {
                        //console.log(path, "excluded");
                        return "";
                    }

                    //console.log(path, "included");

                    return contents;
                }
            }
        },
        compile: {
            options: {
                name: 'core/js/app',
                baseUrl: '<%= sourcedir %>',
                mainConfigFile: './config.js',
                out: '<%= outputdir %>adapt/js/adapt.min.js',
                //fetch these bower plugins an add them as dependencies to the app.js
                plugins: [
                    '<%= sourcedir %>components/*/bower.json',
                    '<%= sourcedir %>extensions/*/bower.json',
                    '<%= sourcedir %>menu/<%= menu %>/bower.json',
                    '<%= sourcedir %>theme/<%= theme %>/bower.json'
                ],
                pluginsPath: '<%= sourcedir %>/plugins.js',
                pluginsModule: 'plugins',
                //translate old style bundle references into something that does exist
                map: {
                    "*": {
                        "components/components": "plugins",
                        "extensions/extensions": "plugins",
                        "menu/menu": "plugins",
                        "theme/theme": "plugins"
                    }
                },
                paths: {
                    "components/components": "plugins",
                    "extensions/extensions": "plugins",
                    "menu/menu": "plugins",
                    "theme/theme": "plugins"
                },
                optimize: 'uglify2',
                onBuildRead: function(moduleName, path, contents) {
                    var isIncludedInBuild = grunt.config('helpers').includedFilter( path );

                    var includes = [
                        "src/core",
                        "plugins"
                    ];

                    var re = '';
                    for(var i = 0, count = includes.length; i < count; i++) {
                        re += includes[i];
                        if(i < includes.length-1) re += '|';
                    }
                    var isIncludedByTask = (new RegExp(re, "i")).test( path );

                    if (!isIncludedByTask && !isIncludedInBuild) {
                        //console.log(path, "excluded");
                        return "";
                    }

                    //console.log(path, "included");

                    return contents;
                }
            }
        }
    }
}
