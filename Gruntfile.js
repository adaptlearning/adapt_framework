module.exports = function(grunt) {
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    var getSourceDir = function() {
        var sourcedir = appendSlash(grunt.option('sourcedir')) || 'src/';
        return sourcedir;
    };

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
        sourcedir: getSourceDir(),
        outputdir: getOutputDir(),
        theme: getTheme(),
        menu: getMenu(),
        pkg: grunt.file.readJSON('package.json'),
        jsonlint: {
            src: [ '<%= sourcedir %>course/**/*.json' ]
        },
        copy: {
            index: {
                files: [
                    {
                        expand: true,
                        src: ['<%= sourcedir %>index.html'],
                        dest: '<%= outputdir %>',
                        filter: 'isFile',
                        flatten: true
                    }
                ]
            },
            courseAssets: {
                files: [
                    {
                        expand: true,
                        src: ['**/*.json'],
                        cwd: '<%= sourcedir %>course/',
                        dest: '<%= outputdir %>course/'
                    }
                ]
            },
            courseJson: {
                files: [
                    {
                        expand: true,
                        src: ['**/*', '!**/*.json'],
                        cwd: '<%= sourcedir %>course/',
                        dest: '<%= outputdir %>course/'
                    }
                ]
            },
            componentAssets: {
                files: [
                    {
                        expand: true,
                        src: ['<%= sourcedir %>components/**/assets/**'],
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
                        src: ['<%= sourcedir %>components/**/fonts/**'],
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
                        src: ['<%= sourcedir %>extensions/**/assets/**'],
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
                        src: ['<%= sourcedir %>extensions/**/fonts/**'],
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
                        src: ['<%= sourcedir %>menu/<%= menu %>/assets/**'],
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
                        src: ['<%= sourcedir %>menu/<%= menu %>/fonts/**'],
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
                        src: ['<%= sourcedir %>theme/<%= theme %>/assets/**'],
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
                        src: ['<%= sourcedir %>theme/<%= theme %>/fonts/**'],
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
                        src: ['<%= sourcedir %>core/js/scriptLoader.js'],
                        dest: '<%= outputdir %>adapt/js/',
                        filter: 'isFile',
                        flatten: true
                    },
                    {
                        expand: true,
                        src: [
                            '<%= sourcedir %>core/js/libraries/require.js',
                            '<%= sourcedir %>core/js/libraries/modernizr.js',
                            '<%= sourcedir %>core/js/libraries/json2.js',
                            '<%= sourcedir %>core/js/libraries/consoles.js',
                            '<%= sourcedir %>core/js/libraries/swfObject.js',
                            '<%= sourcedir %>core/js/libraries/jquery.js',
                            '<%= sourcedir %>core/js/libraries/jquery.v2.js'
                        ],
                        dest: '<%= outputdir %>libraries/',
                        filter: 'isFile',
                        flatten: true
                    },
                    {
                        expand: true,
                        src: ['<%= sourcedir %>extensions/adapt-contrib-spoor/required/**/*'],
                        dest: '<%= outputdir %>'
                    }
                ]
            }
        },
        concat: {
            less: {
                src: [
                    '<%= sourcedir %>core/less/*.less',
                    '<%= sourcedir %>menu/<%= menu %>/**/*.less',
                    '<%= sourcedir %>components/**/*.less',
                    '<%= sourcedir %>extensions/**/*.less',
                    '<%= sourcedir %>theme/<%= theme %>/**/*.less'
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
                    namespace:'Handlebars.templates',
                    processName: function(filePath) {
                        var newFilePath = filePath.split('/');
                        newFilePath = newFilePath[newFilePath.length - 1].replace(/\.[^/.]+$/, '');
                        return  newFilePath;
                    },
                    partialRegex: /.*/,
                    partialsPathRegex: /\/partials\//
                },
                files: {
                    '<%= sourcedir %>templates/templates.js': [
                        '<%= sourcedir %>components/**/*.hbs',
                        '<%= sourcedir %>core/**/*.hbs',
                        '<%= sourcedir %>extensions/**/*.hbs',
                        '<%= sourcedir %>menu/<%= menu %>/**/*.hbs',
                        '<%= sourcedir %>theme/<%= theme %>/**/*.hbs'
                    ]
                }
            }
        },
        bower: {
            target: {
                rjsConfig: './config.js',
                options: {
                    baseUrl: '<%= sourcedir %>'
                }
            }
        },
        'requirejs-bundle': {
            components: {
                src: '<%= sourcedir %>components',
                dest: '<%= sourcedir %>components/components.js',
                options: {
                    baseUrl: "<%= sourcedir %>",
                    moduleName: 'components/components'
                }
            },
            extensions: {
                src: '<%= sourcedir %>extensions',
                dest: '<%= sourcedir %>extensions/extensions.js',
                options: {
                    baseUrl: "<%= sourcedir %>",
                    moduleName: 'extensions/extensions'
                }
            },
            menu: {
                src: '<%= sourcedir %>menu/',
                dest: '<%= sourcedir %>menu/menu.js',
                options: {
                    include: '<%= menu %>',
                    baseUrl: '<%= sourcedir %>',
                    moduleName: 'menu/menu'
                }
            },
            theme: {
                src: '<%= sourcedir %>theme',
                dest: '<%= sourcedir %>theme/theme.js',
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
                    name: 'core/js/app',
                    baseUrl: 'src',
                    mainConfigFile: './config.js',
                    out: '<%= outputdir %>adapt/js/adapt.min.js',
                    generateSourceMaps: true,
                    preserveLicenseComments:false,
                    optimize: 'none'
                }
            },
            compile: {
                options: {
                    name: 'core/js/app',
                    baseUrl: 'src',
                    mainConfigFile: './config.js',
                    out: '<%= outputdir %>adapt/js/adapt.min.js',
                    optimize: 'uglify2'
                }
            }
        },
        watch: {
            less: {
                files: ['<%= sourcedir %>**/*.less'],
                tasks: ['concat', 'less']
            },
            handlebars: {
                files: ['<%= sourcedir %>**/*.hbs'],
                tasks: ['handlebars', 'requirejs:dev']
            },
            courseJson: {
                files: ['<%= sourcedir %>course/**/*.json'],
                tasks : ['jsonlint', 'check-json', 'copy:courseJson']
            },
            courseAssets: {
                files: ['<%= sourcedir %>course/**/*', '!<%= sourcedir %>course/**/*.json'],
                tasks : ['copy:courseAssets']
            },
            js: {
                files: [
                    '<%= sourcedir %>**/*.js',
                    '!<%= sourcedir %>components/components.js',
                    '!<%= sourcedir %>extensions/extensions.js',
                    '!<%= sourcedir %>menu/menu.js',
                    '!<%= sourcedir %>theme/theme.js',
                    '!<%= sourcedir %>templates/templates.js'
                ],
                tasks: ['bower', 'requirejs-bundle', 'requirejs:dev']
            },
            index: {
                files: ['<%= sourcedir %>index.html'],
                tasks: ['copy:index']
            },
            componentsAssets: {
                files: ['<%= sourcedir %>components/**/assets/**'],
                tasks: ['copy:componentAssets']
            },
            componentsFonts: {
                files: ['<%= sourcedir %>components/**/fonts/**'],
                tasks: ['copy:componentFonts']
            },
            extensionsAssets: {
                files: ['<%= sourcedir %>extensions/**/assets/**'],
                tasks: ['copy:extensionAssets']
            },
            extensionsFonts: {
                files: ['<%= sourcedir %>extensions/**/fonts/**'],
                tasks: ['copy:extensionFonts']
            },
            menuAssets: {
                files: ['<%= sourcedir %>menu/<%= menu %>/**/assets/**'],
                tasks: ['copy:menuAssets']
            },
            menuFonts: {
                files: ['<%= sourcedir %>menu/<%= menu %>/**/fonts/**'],
                tasks: ['copy:menuFonts']
            },
            themeAssets: {
                files: ['<%= sourcedir %>theme/<%= theme %>/**/assets/**'],
                tasks: ['copy:themeAssets']
            },
            themeFonts: {
                files: ['<%= sourcedir %>theme/<%= theme %>/**/fonts/**'],
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
              courseFile: '<%= sourcedir %>course/en/course.json',
              blocksFile: '<%= sourcedir %>course/en/blocks.json'
          }
        },
        clean: {
            dist: {
                src: [
                    '<%= sourcedir %>components/components.js',
                    '<%= sourcedir %>extensions/extensions.js',
                    '<%= sourcedir %>menu/menu.js',
                    '<%= sourcedir %>theme/theme.js',
                    '<%= sourcedir %>less',
                    '<%= sourcedir %>templates',
                    '<%= outputdir %>adapt/js/adapt.min.js.map'
                ]
            }
        }
    });

    // This is a simple function to take the course's config.json and append the theme and menu .json
    grunt.registerTask('create-json-config', 'Creating config.json', function() {
        var customItems = ['theme', 'menu'];
        var configJson = grunt.file.readJSON(grunt.config.get('sourcedir') + 'course/config.json');

        customItems.forEach(function (customItem) {
            // As any theme folder may be used, we need to first find the location of the
            // theme.json file
            grunt.file.recurse(grunt.config.get('sourcedir') + customItem + '/', function(abspath, rootdir, subdir, filename) {
                if (filename == customItem + '.json') {
                    customItemJsonFile = rootdir + subdir + '/' + filename;
                }
            });

            if (customItemJsonFile == '') {
                grunt.fail.fatal('Unable to locate ' + customItem + '.json, please ensure a valid ' + customItem + ' exists');
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

        var listOfCourseFiles = ['course', 'contentObjects', 'articles', 'blocks', 'components'];

        var storedIds = [];
        var storedFileParentIds = {};
        var storedFileIds = {};

        var hasOrphanedParentIds = false;
        var orphanedParentIds = [];

        // method to check json ids
        function checkJsonIds() {
            var currentCourseFolder;
            // Go through each course folder inside the <%= sourcedir %>course directory
            grunt.file.expand({filter: 'isDirectory'}, grunt.config.get('sourcedir') + 'course/*').forEach(function(path) {
                // Stored current path of folder - used later to read .json files
                currentCourseFolder = path;

                // Go through each list of declared course files
                listOfCourseFiles.forEach(function(jsonFileName) {
                    // Make sure course.json file is not searched
                    if (jsonFileName !== 'course') {
                        storedFileParentIds[jsonFileName] = [];
                        storedFileIds[jsonFileName] = [];
                        // Read each .json file
                        var currentJsonFile = grunt.file.readJSON(currentCourseFolder + '/' + jsonFileName + '.json');
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
                grunt.fail.fatal('Oops, looks like you have some duplicate _ids: ' + duplicateIds);
            }
        }

        function checkIfOrphanedElementsExist(value, parentFileToCheck) {
            _.each(value, function(parentId) {
                if (parentId === 'course') {
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
                    case 'contentObjects':
                        return checkIfOrphanedElementsExist(value, 'contentObjects');
                    case 'articles':
                        return checkIfOrphanedElementsExist(value, 'contentObjects');
                    case 'blocks':
                        return checkIfOrphanedElementsExist(value, 'articles');
                    case 'components':
                        return checkIfOrphanedElementsExist(value, 'blocks');
                }

            });

            if (hasOrphanedParentIds) {
                grunt.fail.fatal('Oops, looks like you have some orphaned objects: ' + orphanedParentIds);
            }
        }
        checkJsonIds();
    });

    grunt.registerTask('_log-vars', 'Logs out user-defined build variables', function() {
        grunt.log.ok('Using source at "' + grunt.config.get('sourcedir') + '"');
        grunt.log.ok('Building to "' + grunt.config.get('outputdir') + '"');
        if (grunt.config.get('theme') !== '**') grunt.log.ok('Using theme "' + grunt.config.get('theme') + '"');
        if (grunt.config.get('menu') !== '**') grunt.log.ok('Using menu "' + grunt.config.get('menu') + '"');
    });

    grunt.registerTask('_log-server', 'Logs out user-defined build variables', function() {
        grunt.log.ok('Starting server in "' + grunt.config.get('outputdir') + '" using port ' + grunt.config.get('connect.server.options.port'));
    });

    grunt.registerTask('_build', ['_log-vars','jsonlint', 'check-json', 'copy', 'concat', 'less', 'handlebars', 'bower', 'requirejs-bundle', 'create-json-config', 'adapt_insert_tracking_ids']);
    grunt.registerTask('server-build', 'Builds the course without JSON [used by the authoring tool]', ['copy', 'concat', 'less', 'handlebars', 'bower', 'requirejs-bundle', 'requirejs:compile']);
    grunt.registerTask('build', 'Creates a production-ready build of the course', ['_build', 'requirejs:compile', 'clean:dist']);
    grunt.registerTask('dev', 'Creates a developer-friendly build of the course', ['_build', 'requirejs:dev', 'watch']);
    grunt.registerTask('server', 'Runs a local server using port 9001', ['_log-server', 'concurrent:server']);
    grunt.registerTask('server-scorm', 'Runs a SCORM test server using port 9001', ['_log-server', 'concurrent:spoor']);

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
            '_log-vars',
            '_log-server',
            '_build',
            'server-build',
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
