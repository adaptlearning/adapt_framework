module.exports = function(grunt) {
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
    var outputdir = grunt.option('outputdir') || '',
        theme = grunt.option('theme') || 'adapt-contrib-vanilla';

    if (outputdir) {
        if (outputdir.substring(outputdir.length - 1, outputdir.length) !== '/') {
            // Append a slash if required
            outputdir = outputdir + '/';
        }
        
        grunt.log.writeln('** Building to ' + outputdir);
    }

    if (theme) {
        grunt.log.writeln('** Using theme ' + theme);
    }
    
    grunt.initConfig({
        outputdir: outputdir,
        theme: theme,
        pkg: grunt.file.readJSON('package.json'),
        jsonlint: {
            src: [ 'src/course/**/*.json' ]
        },
        copy: {
            index: {
                files: [
                    {
                        expand: true, 
                        src: ['src/index.html'], 
                        dest: '<%= outputdir %>build/', 
                        filter: 'isFile', 
                        flatten: true
                    },
                ]
            },
            courseJson: {
                files: [
                    {
                        expand: true, 
                        src: ['**/*.json'], 
                        dest: '<%= outputdir %>build/course/', 
                        cwd: 'src/course/'
                    }
                ]
            },
            courseAssets: {
                files: [
                    {
                        expand: true, 
                        src: ['**/*','!**/*.json'], 
                        dest: '<%= outputdir %>build/course/', 
                        cwd: 'src/course/'
                    }
                ]
            },
            componentsAssets: {
                files: grunt.file.expand(['src/components/*/']).map(function(cwd) {
                    return {
                        expand: true,
                        src: ['**'],
                        dest: '<%= outputdir %>build/assets/',
                        cwd: cwd + 'assets/',
                        filter: "isFile"
                    };
                })
            },
            extensionsAssets: {
                files: grunt.file.expand(['src/extensions/*/']).map(function(cwd) {
                    return {
                        expand: true,
                        src: ['**'],
                        dest: '<%= outputdir %>build/assets/',
                        cwd: cwd + 'assets/',
                        filter: "isFile"
                    };
                })
            },
            menuAssets: {
                files: grunt.file.expand(['src/menu/*/']).map(function(cwd) {
                    return {
                        expand: true,
                        src: ['**'],
                        dest: '<%= outputdir %>build/assets/',
                        cwd: cwd + 'assets/',
                        filter: "isFile"
                    };
                })
            },
            themeAssets: {
                files: [
                    {
                        expand: true,
                        src: ['**'],
                        dest: '<%= outputdir %>build/assets/',
                        cwd:'src/theme/<%= theme %>/assets/',
                        filter: 'isFile'
                    }
                ]
            },
            themeFonts: {
                files: [
                    {
                        expand: true,
                        src: ['**'],
                        dest: '<%= outputdir %>build/adapt/css/fonts/',
                        cwd:'src/theme/<%= theme %>/fonts/',
                        filter: 'isFile'
                    }
                ]
            },
            main: {
                files: [
                    {
                        expand: true, 
                        src: ['**/*'], 
                        dest: '<%= outputdir %>build/course/', 
                        cwd: 'src/course/'
                    },
                    {
                        expand: true, 
                        src: ['src/core/js/scriptLoader.js'], 
                        dest: '<%= outputdir %>build/adapt/js/', 
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
                        dest: '<%= outputdir %>build/libraries/', 
                        filter: 'isFile', 
                        flatten: true
                    },
                    {
                        expand: true,
                        src: ['**/*'],
                        dest: '<%= outputdir %>build/',
                        cwd: 'src/extensions/adapt-contrib-spoor/required/'
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
                    'src/theme/<%= theme %>/**/*.less'
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
                    '<%= outputdir %>build/adapt/css/adapt.css' : 'src/less/adapt.less'
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
                src: 'src/theme/',
                dest: 'src/theme/theme.js',
                options: {
                    baseUrl: "src",
                    include: theme,
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
                    out: "<%= outputdir %>build/adapt/js/adapt.min.js",
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
                    out: "<%= outputdir %>build/adapt/js/adapt.min.js",
                    optimize:"uglify2"
                }
            }
        },
        watch: {
            less: {
                files: ['src/**/*.less'],
                tasks: ['concat', 'less']
            },
            handlebars: {
                files: ['src/**/*.hbs'],
                tasks: ['handlebars', 'compile']
            },
            courseJson: {
                files: [
                    'src/course/**/*.json'
                ],
                tasks : ['jsonlint', 'copy:courseJson']
            },
            courseAssets: {
                files: [
                    'src/course/**/*', '!src/course/**/*.json'
                ],
                tasks : ['copy:courseAssets']
            },
            js: {
                files: [
                    'src/**/*.js', 
                    '!src/extensions/extensions.js',
                    '!src/menu/menu.js',
                    '!src/theme/theme.js',
                    '!src/templates/templates.js',
                ],
                tasks: ['compile']
            },
            index: {
                files: ['src/index.html'],
                tasks: ['copy:index']
            },
            componentsAssets: {
                files: [
                    'src/components/**/assets/**'
                ],
                tasks: ['copy:componentsAssets']
            },
            extensionsAssets: {
                files: [
                    'src/extensions/**/assets/**'
                ],
                tasks: ['copy:extensionsAssets']
            },
            menuAssets: {
                files: [
                    'src/menu/**/assets/**'
                ],
                tasks: ['copy:menuAssets']
            },
            themeAssets: {
                files: [
                    'src/theme/<%= theme %>/assets/**'
                ],
                tasks: ['copy:themeAssets']
            },
            themeFonts: {
                files: [
                    'src/theme/<%= theme %>/fonts/**',
                ],
                tasks: ['copy:themeFonts']
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
                base: 'build',
                keepalive:true
              }
            },
            spoorOffline: {
                options: {
                    port: 9001,
                    base: 'build',
                    keepalive:true
                }
            }
        },
        
        adapt_insert_tracking_ids: {
          options: {
              courseFile: "src/course/en/course.json",
              blocksFile: "src/course/en/blocks.json"
          }
        },

        nightwatch: {
            options: {
                standalone: true,
                jar_url: 'http://selenium-release.storage.googleapis.com/2.40/selenium-server-standalone-2.40.0.jar'
            }
        }
    });
    
    grunt.loadNpmTasks('grunt-contrib-concat');

    // This is a simple function to take the course's config.json and append the theme.json
    grunt.registerTask('create-json-config', 'Creating config.json', function() {

        var themeJsonFile = '';

        // As any theme folder may be used, we need to first find the location of the
        // theme.json file
        grunt.file.recurse('src/theme/', function(abspath, rootdir, subdir, filename) {
            if (filename == 'theme.json') {
                themeJsonFile = rootdir + subdir + '/' + filename;
            }
        });

        if (themeJsonFile == '') {
            grunt.fail.fatal("Unable to locate theme.json, please ensure a valid theme exists");
        }

        var configJson = grunt.file.readJSON('src/course/config.json');
        var themeJson = grunt.file.readJSON(themeJsonFile);

        // This effectively combines the JSON   
        for (var prop in themeJson) {           
            configJson[prop] = themeJson[prop];
        }

        grunt.file.write('build/course/config.json', JSON.stringify(configJson));
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

    grunt.registerTask('default', ['less', 'handlebars', 'watch']);
    grunt.registerTask('compile', ['bower', 'requirejs-bundle', 'requirejs:dev']);
    grunt.registerTask('server', ['concurrent:server']);
    grunt.registerTask('server-scorm', ['concurrent:spoor']);
    grunt.registerTask('build', ['jsonlint', 'check-json', 'copy', 'concat', 'less', 'handlebars', 'bower', 'requirejs-bundle', 'requirejs:compile', 'create-json-config']);
    grunt.registerTask('server-build', ['copy', 'concat', 'less', 'handlebars', 'bower', 'requirejs-bundle', 'requirejs:compile']);
    grunt.registerTask('dev', ['jsonlint', 'copy', 'concat', 'less', 'handlebars', 'bower', 'requirejs-bundle', 'requirejs:dev', 'create-json-config', 'watch']);
    
    grunt.registerTask('acceptance',['compile', 'concurrent:selenium']);

    grunt.loadNpmTasks('adapt-grunt-tracking-ids');
    grunt.loadNpmTasks('grunt-jsonlint');
    grunt.registerTask('tracking-insert', 'adapt_insert_tracking_ids');
};
