/**
* CGKineo Internal Adapt Gruntfile.js
* Authors: Thomas Taylor <thomas.taylor@kineo.com>, Gavin McMaster <gavin.mcmaster@kineo.com>
* version: 1.0
*
* TODO: add support for multiple menus
*/
module.exports = function(grunt) {
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    var config = require('./grunt_config.json');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        jsonlint: {
            sample: {
                src: [ 'course/course/**/*.json' ]
            }   
        },

        copy: {
            index: {
                files: [
                    {
                        expand: true, 
                        src: ['src/index.html'], 
                        dest: 'builds/<%= grunt.option("moduleid") %>', 
                        filter: 'isFile', 
                        flatten: true
                    },
                ]
            },
            courseJson: {
                files: [
                    {
                        expand: true, 
                        src: ['**/*.json', '!**/config.json'],
                        dest: 'builds/<%= grunt.option("moduleid") %>/course/', 
                        cwd: 'src/courses/<%= grunt.option("moduleid") %>'
                    }
                ]
            },
            courseAssets: {
                files: [
                    {
                        expand: true, 
                        src: ['**/*','!**/*.json'], 
                        dest: 'builds/<%= grunt.option("moduleid") %>/course/', 
                        cwd: 'src/courses/<%= grunt.option("moduleid") %>'
                    }
                ]
            },
            main: {
                files: [
                    {
                        expand: true, 
                        src: ['**/*'], 
                        dest: 'builds/<%= grunt.option("moduleid") %>/course/', 
                        cwd: 'src/courses/<%= grunt.option("moduleid") %>'
                    },
                    {
                        expand: true, 
                        src: ['src/core/js/scriptLoader.js'], 
                        dest: 'builds/<%= grunt.option("moduleid") %>/adapt/js/', 
                        filter: 'isFile', 
                        flatten: true
                    },
                    {
                        expand: true, 
                        src: [
                            'src/core/js/libraries/require.js', 
                            'src/core/js/libraries/modernizr.js',
                            'src/core/js/libraries/json2.js',
                            'src/core/js/libraries/consoles.js',
                            'src/core/js/libraries/swfObject.js'
                        ], 
                        dest: 'builds/<%= grunt.option("moduleid") %>/libraries/', 
                        filter: 'isFile', 
                        flatten: true
                    },
                    {
                        expand: true,
                        flatten: true,
                        src: ['src/theme/<%= grunt.option("theme") %>/**/fonts/**'],
                        dest: 'builds/<%= grunt.option("moduleid") %>/adapt/css/fonts/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        flatten: true,
                        src: ['src/theme/<%= grunt.option("theme") %>/**/assets/**'],
                        dest: 'builds/<%= grunt.option("moduleid") %>/adapt/css/assets/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        flatten: true,
                        src: ['src/components/**/assets/**'],
                        dest: 'builds/<%= grunt.option("moduleid") %>/assets/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        flatten: true,
                        src: ['src/extensions/adapt-contrib-spoor/required/*'],
                        dest: 'builds/<%= grunt.option("moduleid") %>/',
                        filter: 'isFile'
                    }
                ]
            }
        },

        concat: {
            less: {
                src: [
                    'src/core/less/*.less',
                    'src/menu/**/*.less', 
                    'src/components/**/*.less', 
                    'src/extensions/**/*.less',
                    'src/theme/<%= grunt.option("theme") %>/**/*.less'
                ],
                dest: 'src/less/adapt.less'
            }
        },

        less: {
            options:{
                compress:true
            },
            dist: {
                files: {
                    'builds/<%= grunt.option("moduleid") %>/adapt/css/adapt.css' : 'src/less/adapt.less'
                }
            }
        },

        handlebars: {
            compile: {
                options: {
                    namespace:"Handlebars.templates",
                    processName: function(filePath) {
                        var newFilePath = filePath.split("/");
                        newFilePath = newFilePath[newFilePath.length - 1].replace(/\.[^/.]+$/, "");
                        return  newFilePath;
                    },
                    partialRegex: /.*/,
                    partialsPathRegex: /\/partials\//
                },
                files: {
                    'src/templates/templates.js': 'src/**/*.hbs'
                }
            }
        },

        bower: {
            target: {
                rjsConfig: './config.js',
                options: {
                    baseUrl: 'src'
                }
            }
        },

        'requirejs-bundle': {
            components: {
                src: 'src/components',
                dest: 'src/components/components.js',
                options: {
                    baseUrl: "src",
                    moduleName: 'components/components'
                }
            },
            extensions: {
                src: 'src/extensions/',
                dest: 'src/extensions/extensions.js',
                options: {
                    baseUrl: "src",
                    moduleName: 'extensions/extensions'
                }
            },
            menu: {
                src: 'src/menu/',
                dest: 'src/menu/menu.js',
                options: {
                    baseUrl: "src",
                    moduleName: 'menu/menu'
                }
            },
            theme: {
                src: 'src/theme/<%= grunt.option("theme") %>',
                dest: 'src/theme/theme.js',
                options: {
                    baseUrl: "src",
                    moduleName: 'themes/themes'
                }
            }
        },

        requirejs: {
            dev: {
                options: {
                    name: "core/js/app",
                    baseUrl: "src",
                    mainConfigFile: "./config.js",
                    out: './builds/<%= grunt.option("moduleid") %>/adapt/js/adapt.min.js',
                    generateSourceMaps: true,
                    preserveLicenseComments:false,
                    optimize: "none"
                }
            },
            compile: {
                options: {
                    name: "core/js/app",
                    baseUrl: "src",
                    mainConfigFile: "./config.js",
                    out: './builds/<%= grunt.option("moduleid") %>/adapt/js/adapt.min.js',
                    optimize:"uglify2"
                }
            }
        },

        _watch: {
            less: {
                files: ['src/**/*.less'],
                tasks: ['concat', 'less'],
                options: {
                    spawn: false,
                },
            },
            handlebars: {
                files: ['src/**/*.hbs'],
                tasks: ['handlebars', 'compile'],
                options: {
                    spawn: false,
                },
            },
            courseJson: {
                files: [
                    'src/courses/<%= grunt.option("moduleid") %>/**/*.json', '!src/courses/<%= grunt.option("moduleid") %>/config.json'
                ],
                tasks : ['jsonlint', 'copy:courseJson'],
                options: {
                    spawn: false,
                },
            },    
            configJson: {
                files: [
                    'src/courses/<%= grunt.option("moduleid") %>/config.json', 'src/theme/<%= grunt.option("theme") %>/theme.json',
                ],
                tasks : ['jsonlint', 'create-json-config'],
                options: {
                    spawn: false,
                },
            },        
            courseAssets: {
                files: [
                    'src/courses/<%= grunt.option("moduleid") %>/**/*', '!src/courses/<%= grunt.option("moduleid") %>/**/*.json', '!src/courses/<%= grunt.option("moduleid") %>/config.json'
                ],
                tasks : ['copy:courseAssets'],
                options: {
                    spawn: false,
                },
            },
            js: {
                files: [
                    'src/**/*.js', 
                    '!src/components/components.js',
                    '!src/extensions/extensions.js',
                    '!src/menu/menu.js',
                    '!src/theme/theme.js',
                    '!src/templates/templates.js',
                ],
                tasks: ['compile'],
                options: {
                    spawn: false,
                },
            },
            index: {
                files: ['src/index.html'],
                tasks: ['copy:index'],
                options: {
                    spawn: false,
                },
            },
            assets: {
                files: [
                    'src/theme/<%= grunt.option("theme") %>/**/fonts/**',
                    'src/theme/<%= grunt.option("theme") %>/**/assets/**',
                    'src/components/**/assets/**'
                ],
                tasks: ['copy:main'],
                options: {
                    spawn: false,
                },
            }   
        },

        open: {
            server: {
                path: 'http://localhost:<%= connect.server.options.port %>/'
            },
            spoor: {
                path: 'http://localhost:<%= connect.server.options.port %>/main.html'
            }
        },

        concurrent: {
            server: ['connect:server', 'open:server'],
            spoor: ['connect:spoorOffline', 'open:spoor'],
            selenium: ['connect:spoorOffline', 'nightwatch']
        },

        connect: {
            server: {
              options: {
                port: 9001,
                base: 'builds/<%= grunt.option("moduleid") %>',
                keepalive:true
              }
            },
            spoorOffline: {
                options: {
                    port: 9001,
                    base: 'builds/<%= grunt.option("moduleid") %>',
                    keepalive:true
                }
            }
        },
        
        adapt_insert_tracking_ids: {
          options: {
              courseFile: "src/courses/<%= grunt.option('moduleid') %>/en/course.json",
              blocksFile: "src/courses/<%= grunt.option('moduleid') %>/en/blocks.json"
          }
        },

        nightwatch: {
            options: {
                standalone: true,
                jar_url: 'http://selenium-release.storage.googleapis.com/2.40/selenium-server-standalone-2.40.0.jar'
            }
        }
    });

    grunt.registerTask('watch', 'Task has been depreciated', function() {
        grunt.log.writeln();
        grunt.log.error("The watch task has been depreciated, please use dev or devmod:[id] instead.");
        grunt.log.writeln();
        grunt.log.writeln("For more details on what commands are available, check:");
        grunt.log.writeln("https://git.kineo.com/adapt/grunt-build-process/blob/master/README.md");
    });
    
    grunt.loadNpmTasks('grunt-contrib-concat');

    // This is a simple function to take the course's config.json and append the theme.json
    grunt.registerTask('create-json-config', 'Creating config.json', function() {

        var themeJsonFile = '';

        // As any theme folder may be used, we need to first find the location of the
        // theme.json file
        grunt.file.recurse('src/theme/' + grunt.option("theme") + '/', function(abspath, rootdir, subdir, filename) {
            if (filename == 'theme.json') {
                themeJsonFile = rootdir;
                if(subdir) themeJsonFile += subdir; // account for no sub-directory
                themeJsonFile += '/' + filename;
            }
        });

        if (themeJsonFile == '') {
            grunt.fail.fatal("Unable to locate theme.json, please ensure a valid theme exists");
        }

        var configJson = grunt.file.readJSON('src/courses/' + grunt.option("moduleid") + '/config.json');
        var themeJson = grunt.file.readJSON(themeJsonFile);

        // This effectively combines the JSON   
        for (var prop in themeJson) {           
            configJson[prop] = themeJson[prop];
        }

        grunt.file.write('builds/' + grunt.option("moduleid")  + '/course/config.json', JSON.stringify(configJson));
    });

    grunt.registerTask('check-json', 'Checking course.json', function() {

        var _ = require('underscore');
        var listOfCourseFiles = ["course", "contentObjects", "articles", "blocks", "components"];
        var currentJsonFile;
        var storedIds = [];
        var storedFileParentIds = {};
        var storedFileIds = {};
        var hasOrphanedParentIds = false;
        var orphanedParentIds = [];

        // method to check json ids
        function checkJsonIds() {
            var currentCourseFolder;
            // Go through each course folder inside the src/course directory
            grunt.file.expand({filter: "isDirectory"}, "src/course/*").forEach(function(path) {
                // Stored current path of folder - used later to read .json files
                currentCourseFolder = path;
                // Go through each list of declared course files
                listOfCourseFiles.forEach(function(jsonFileName) {
                    // Make sure course.json file is not searched
                    if (jsonFileName !== "course") {
                        storedFileParentIds[jsonFileName] = [];
                        storedFileIds[jsonFileName] = [];
                        // Read each .json file
                        var currentJsonFile = grunt.file.readJSON(currentCourseFolder + "/" + jsonFileName + ".json");
                        currentJsonFile.forEach(function(item) {
                            // Store _parentIds and _ids to be used by methods below
                            storedFileParentIds[jsonFileName].push(item._parentId);
                            storedFileIds[jsonFileName].push(item._id);
                            storedIds.push(item._id);
                        });
                    }
                });
                checkDuplicateIds();
                checkEachElementHasParentId();
            });
        }

        function checkDuplicateIds() {
            // Change _ids into an object of key value pairs that contains _ids as keys and a number count of same _ids
            var countIdsObject = _.countBy(storedIds);
            var hasDuplicateIds = false;
            var duplicateIds = [];
            _.each(countIdsObject, function(value, key) {
                // Check value of each _ids is not more than 1
                if (value > 1) {
                    hasDuplicateIds = true;
                    duplicateIds.push(key);
                }
            });
            // Check if any duplicate _ids exist and return error
            if (hasDuplicateIds) {
                grunt.fail.fatal("Oops, looks like you have some duplicate _ids: " + duplicateIds);
            }
        }

        function checkIfOrphanedElementsExist(value, parentFileToCheck) {
            _.each(value, function(parentId) {
                if (parentId === "course") {
                    return;
                }
                if (_.indexOf(storedFileIds[parentFileToCheck], parentId) === -1) {
                    hasOrphanedParentIds = true;
                    orphanedParentIds.push(parentId);
                };
            });
        }

        function checkEachElementHasParentId() {
            _.each(storedFileParentIds, function(value, key) {
                switch(key){
                    case "contentObjects":
                        return checkIfOrphanedElementsExist(value, "contentObjects");
                    case "articles":
                        return checkIfOrphanedElementsExist(value, "contentObjects");
                    case "blocks":
                        return checkIfOrphanedElementsExist(value, "articles");
                    case "components":
                        return checkIfOrphanedElementsExist(value, "blocks");
                }
            });
            if (hasOrphanedParentIds) {
                grunt.fail.fatal("Oops, looks like you have some orphaned objects: " + orphanedParentIds);
            }
        }
        checkJsonIds();
    });

    grunt.registerTask('compile', ['bower', 'requirejs-bundle', 'requirejs:dev']);
    
    grunt.registerTask('server', function(moduleid) {
        if(!moduleid) {
            moduleid = config.modules[0];
            grunt.log.writeln('No module specified, running ' + moduleid);
        }
        if(!checkValidMod(moduleid)) return;

        grunt.option("moduleid", moduleid);
        grunt.task.run('concurrent:server');
    });

    grunt.registerTask('server-scorm', function(moduleid) {
        if(!moduleid) {
            moduleid = config.modules[0];
            grunt.log.writeln('No module specified, running ' + moduleid);
        }
        if(!checkValidMod(moduleid)) return;

        grunt.option("moduleid", moduleid);
        grunt.task.run('concurrent:spoor');
    });
    
    //grunt.registerTask('acceptance',['compile', 'concurrent:selenium']);

    grunt.registerTask('buildProcessRelease', ['jsonlint', 'check-json', 'copy', 'concat', 'less', 'handlebars', 'bower', 'requirejs-bundle', 'requirejs:compile', 'create-json-config']);
    grunt.registerTask('buildProcessDev', ['jsonlint', 'check-json', 'copy', 'concat', 'less', 'handlebars', 'bower', 'requirejs-bundle', 'requirejs:dev', 'create-json-config']);

    grunt.registerTask('buildmod', 'Builds the specified module.', function(moduleid, devMode) {
        // check we're good to go
        if(!checkValidMod(moduleid)) return;

        // use custom or default theme depending on grunt_config
        var customTheme = config.themes.custom[moduleid];
        var theme = (customTheme) ? customTheme : config.themes.default;

        grunt.option("moduleid", moduleid);
        grunt.option("theme", theme);

        // log out some info...
        grunt.log.writeln();
        grunt.log.writeln("Building module '" + grunt.option("moduleid") + "' dev: " + devMode);
        grunt.log.writeln("Using theme '" + grunt.option("theme") + "'");
        
        var task = (!!devMode === true) ? "buildProcessDev" : "buildProcessRelease";
        grunt.task.run(task);
    }); 

    grunt.registerTask('build', 'Builds the first module.', function() {
        grunt.task.run('buildmod:' + config.modules[0]);
    });

    grunt.registerTask('buildall', 'Creates builds for all modules', function() {
        var mods = config.modules;
        for (var i = 0; i < mods.length; i++) grunt.task.run('buildmod:' + mods[i]);
    });

    grunt.registerTask('dev', 'Builds the specified module in DEV MODE.', function() {
        grunt.task.run('devmod:' + config.modules[0] + ":true");
    });

    grunt.registerTask('devmod', 'Builds the first module in DEV MODE.', function(moduleid) {
        grunt.task.run(['buildmod:' + moduleid + ":true", "_watch"]);
    });

    grunt.registerTask('devall', 'Creates builds for all modules', function() {
        var mods = config.modules;
        for (var i = 0; i < mods.length; i++) grunt.task.run('buildmod:' + mods[i] + ":true");
    });

    grunt.loadNpmTasks('adapt-grunt-tracking-ids');
    grunt.loadNpmTasks('grunt-jsonlint');
    
    grunt.registerTask('tracking-insert', '', function(moduleid) {
        grunt.option("moduleid", moduleid);
        grunt.task.run('adapt_insert_tracking_ids');        
    });

    function checkValidMod(id) {
        var mods = config.modules;
        var exists = false;
        for (var i = 0; i < mods.length; i++) {
            if(mods[i] === id) {
                exists = true;
                break;
            }
        }
        if(!exists) grunt.log.writeln("FATAL ERROR! '" + id + "' not specified in grunt_config.json. Try again...");
        return exists;
    };
};
