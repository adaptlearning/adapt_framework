module.exports = function(grunt) {
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    var getOutputDir = function() {
        var outputdir = appendSlash(grunt.option('outputdir')) || 'build/';
        return outputdir;
    };

    var getTheme = function() {
        var theme = grunt.option('theme');
        return theme || '**';
    };

    var getMenu = function() {
        var menu = grunt.option('menu');
        return menu || '**';
    };

    var appendSlash = function(dir) {
        if (dir) {
            var lastChar = dir.substring(dir.length - 1, dir.length);
            if (lastChar !== '/') return dir + '/';
        }
    };

    grunt.initConfig({
        outputdir: getOutputDir(),
        theme: getTheme(),
        menu: getMenu(),
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
                        dest: '<%= outputdir %>',
                        filter: 'isFile',
                        flatten: true
                    }
                ]
            },
            course: {
                files: [
                    {
                        expand: true,
                        src: ['**/*'],
                        cwd: 'src/course/',
                        dest: '<%= outputdir %>course/'
                    }
                ]
            },
            componentAssets: {
                files: [
                    {
                        expand: true,
                        src: ['src/components/**/assets/**'],
                        dest: '<%= outputdir %>assets/',
                        filter: "isFile",
                        flatten: true
                    }
                ]
            },
            componentFonts: {
                files: [
                    {
                        expand: true,
                        src: ['src/components/**/fonts/**'],
                        dest: '<%= outputdir %>adapt/css/fonts/',
                        filter: "isFile",
                        flatten: true
                    }
                ]
            },
            extensionAssets: {
                files: [
                    {
                        expand: true,
                        src: ['src/extensions/**/assets/**'],
                        dest: '<%= outputdir %>assets/',
                        filter: "isFile",
                        flatten: true
                    }
                ]
            },
            extensionFonts: {
                files: [
                    {
                        expand: true,
                        src: ['src/extensions/**/fonts/**'],
                        dest: '<%= outputdir %>adapt/css/fonts/',
                        filter: "isFile",
                        flatten: true
                    }
                ]
            },
            menuAssets: {
                files: [
                    {
                        expand: true,
                        src: ['src/menu/<%= menu %>/assets/**'],
                        dest: '<%= outputdir %>assets/',
                        filter: "isFile",
                        flatten: true
                    }
                ]
            },
            menuFonts: {
                files: [
                    {
                        expand: true,
                        src: ['src/menu/<%= menu %>/fonts/**'],
                        dest: '<%= outputdir %>adapt/css/fonts/',
                        filter: "isFile",
                        flatten: true
                    }
                ]
            },
            themeAssets: {
                files: [
                    {
                        expand: true,
                        src: ['src/theme/<%= theme %>/assets/**'],
                        dest: '<%= outputdir %>adapt/css/assets/',
                        filter: "isFile",
                        flatten: true
                    }
                ]
            },
            themeFonts: {
                files: [
                    {
                        expand: true,
                        src: ['src/theme/<%= theme %>/fonts/**'],
                        dest: '<%= outputdir %>adapt/css/fonts/',
                        filter: "isFile",
                        flatten: true
                    }
                ]
            },
            main: {
                files: [
                    {
                        expand: true,
                        src: ['src/core/js/scriptLoader.js'],
                        dest: '<%= outputdir %>adapt/js/',
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
                            'src/core/js/libraries/swfObject.js',
                            'src/core/js/libraries/jquery.js',
                            'src/core/js/libraries/jquery.v2.js'
                        ],
                        dest: '<%= outputdir %>libraries/',
                        filter: 'isFile',
                        flatten: true
                    },
                    {
                        expand: true,
                        src: ['src/extensions/adapt-contrib-spoor/required/**/*'],
                        dest: '<%= outputdir %>'
                    }
                ]
            }
        },
        concat: {
            less: {
                src: [
                    'src/core/less/*.less',
                    'src/menu/<%= menu %>/**/*.less',
                    'src/components/**/*.less',
                    'src/extensions/**/*.less',
                    'src/theme/<%= theme %>/**/*.less'
                ],
                dest: '<%= sourcedir %>less/adapt.less'
            }
        },
        less: {
            options:{
                compress:true
            },
            dist: {
                files: {
                    '<%= outputdir %>adapt/css/adapt.css' : '<%= sourcedir %>less/adapt.less'
                }
            }
        },
        handlebars: {
            compile: {
                options: {
                    amd: 'handlebars',
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
                    'src/templates/templates.js': [
                        'src/components/**/*.hbs',
                        'src/core/**/*.hbs',
                        'src/extensions/**/*.hbs',
                        'src/menu/<%= menu %>/**/*.hbs',
                        'src/theme/<%= theme %>/**/*.hbs'
                    ]
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
                src: 'src/extensions',
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
                    include: '<%= menu %>',
                    baseUrl: 'src',
                    moduleName: 'menu/menu'
                }
            },
            theme: {
                src: 'src/theme',
                dest: 'src/theme/theme.js',
                options: {
                    include: '<%= theme %>',
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
                    out: "<%= outputdir %>adapt/js/adapt.min.js",
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
                    out: "<%= outputdir %>adapt/js/adapt.min.js",
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
                files: ['src/course/**/*.json'],
                tasks : ['jsonlint', 'copy:courseJson']
            },
            courseAssets: {
                files: ['src/course/**/*', '!src/course/**/*.json'],
                tasks : ['copy:courseAssets']
            },
            js: {
                files: [
                    'src/**/*.js',
                    '!src/components/components.js',
                    '!src/extensions/extensions.js',
                    '!src/menu/menu.js',
                    '!src/theme/theme.js',
                    '!src/templates/templates.js'
                ],
                tasks: ['compile']
            },
            index: {
                files: ['src/index.html'],
                tasks: ['copy:index']
            },
            componentsAssets: {
                files: ['src/components/**/assets/**'],
                tasks: ['copy:componentAssets']
            },
            componentsFonts: {
                files: ['src/components/**/fonts/**'],
                tasks: ['copy:componentFonts']
            },
            extensionsAssets: {
                files: ['src/extensions/**/assets/**'],
                tasks: ['copy:extensionAssets']
            },
            extensionsFonts: {
                files: ['src/extensions/**/fonts/**'],
                tasks: ['copy:extensionFonts']
            },
            menuAssets: {
                files: ['src/menu/<%= menu %>/**/assets/**'],
                tasks: ['copy:menuAssets']
            },
            menuFonts: {
                files: ['src/menu/<%= menu %>/**/fonts/**'],
                tasks: ['copy:menuFonts']
            },
            themeAssets: {
                files: ['src/theme/<%= theme %>/**/assets/**'],
                tasks: ['copy:themeAssets']
            },
            themeFonts: {
                files: ['src/theme/<%= theme %>/**/fonts/**'],
                tasks: ['copy:themeFonts']
            }
        },
        open: {
            server: {
                path: 'http://localhost:<%= connect.server.options.port %>/'
            },
            spoor: {
                path: 'http://localhost:<%= connect.server.options.port %>/scorm_test_harness.html'
            }
        },
        concurrent: {
            server: ['connect:server', 'open:server'],
            spoor: ['connect:spoorOffline', 'open:spoor']
        },
        connect: {
            server: {
              options: {
                port: 9001,
                base: '<%= outputdir %>',
                keepalive:true
              }
            },
            spoorOffline: {
                options: {
                    port: 9001,
                    base: '<%= outputdir %>',
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
        clean: {
            dist: {
                src: [
                    "src/components/components.js",
                    "src/extensions/extensions.js",
                    "src/menu/menu.js",
                    "src/theme/theme.js",
                    "src/less",
                    "src/templates",
                    "<%= outputdir %>adapt/js/adapt.min.js.map"
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');

    // This is a simple function to take the course's config.json and append the theme and menu .json
    grunt.registerTask('create-json-config', 'Creating config.json', function() {
        var customItems = ['theme', 'menu'];
        var configJson = grunt.file.readJSON('src/course/config.json');

        customItems.forEach(function (customItem) {
            // As any theme folder may be used, we need to first find the location of the
            // theme.json file
            grunt.file.recurse('src/' + customItem + '/', function(abspath, rootdir, subdir, filename) {
                if (filename == customItem + '.json') {
                    customItemJsonFile = rootdir + subdir + '/' + filename;
                }
            });

            if (customItemJsonFile == '') {
                grunt.fail.fatal("Unable to locate " + customItem + ".json, please ensure a valid " + customItem + " exists");
            }

            var customItemJson = grunt.file.readJSON(customItemJsonFile);

            // This effectively combines the JSON
            for (var prop in customItemJson) {
                configJson[prop] = customItemJson[prop];
            }
        });

        grunt.file.write(grunt.config.get('outputdir') + 'course/config.json', JSON.stringify(configJson));
    });

    grunt.registerTask('check-json', 'Checks the course json for duplicate IDs, and that each element has a parent', function() {
        var _ = require('underscore');

        var listOfCourseFiles = ["course", "contentObjects", "articles", "blocks", "components"];

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
                }
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

    grunt.registerTask('server-build', 'Builds the course without JSON [used by the authoring tool]', ['copy', 'concat', 'less', 'handlebars', 'bower', 'requirejs-bundle', 'requirejs:compile']);
    grunt.registerTask('_build', ['jsonlint', 'check-json', 'copy', 'concat', 'less', 'handlebars', 'bower', 'requirejs-bundle', 'create-json-config', 'adapt_insert_tracking_ids']);
    grunt.registerTask('build', 'Creates a production-ready build of the course', ['_build', 'requirejs:compile', 'clean:dist']);
    grunt.registerTask('dev', 'Creates a developer-friendly build of the course', ['_build', 'requirejs:dev', 'watch']);

    grunt.registerTask('server', 'Runs a local server using port 9001', ['concurrent:server']);
    grunt.registerTask('server-scorm', 'Runs a SCORM test server using port 9001', ['concurrent:spoor']);

    // Lists out the available tasks along with their descriptions, ignoring any listed in the array below
    grunt.registerTask('help', function() {
        // for some nice colouring
        var chalk = require('chalk');
        // the following tasks won't be shown
        var ignoredTasks = [
            'bower',
            'concurrent',
            'clean',
            'connect',
            'copy',
            'handlebars',
            'less',
            'requirejs',
            'watch',
            'jsonlint',
            'open',
            'requirejs-bundle',
            'concat',
            'create-json-config',
            'check-json',
            'server-build',
            '_build',
            'adapt_insert_tracking_ids',
            'adapt_remove_tracking_ids',
            'adapt_reset_tracking_ids'
        ];

        grunt.log.writeln('');
        grunt.log.writeln(chalk.underline('Adapt Learning automated build process'));
        grunt.log.writeln('');
        grunt.log.writeln('See below for the list of available tasks:');
        grunt.log.writeln('');

        for(var key in grunt.task._tasks) {
            if(this.name !== key && -1 === ignoredTasks.indexOf(key)) {
                writeTask(grunt.task._tasks[key]);
            }
        }

        grunt.log.writeln('');
        grunt.log.writeln('Run a task using: grunt [task name]');
        grunt.log.writeln('');
        grunt.log.writeln('For more information, see https://github.com/adaptlearning/adapt_framework/wiki');

        function writeTask(task) {
            grunt.log.writeln(chalk.cyan(task.name) + "   " + task.info);
        }
    });

    grunt.loadNpmTasks('adapt-grunt-tracking-ids');
};
