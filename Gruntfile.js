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
                src: [ 'src/courses/<%= grunt.option("moduleID") %>/**/*.json' ]
            }
        },

        clean: {
            build: ['builds/<%= grunt.option("moduleID") %>/**']
        },

        copy: {
            index: {
                files: [
                    {
                        expand: true,
                        src: ['src/index.html'],
                        dest: 'builds/<%= grunt.option("moduleID") %>',
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
                        dest: 'builds/<%= grunt.option("moduleID") %>/course/',
                        cwd: 'src/courses/<%= grunt.option("moduleID") %>'
                    }
                ]
            },
            courseAssets: {
                files: [
                    {
                        expand: true,
                        src: ['**/*','!**/*.json'],
                        dest: 'builds/<%= grunt.option("moduleID") %>/course/',
                        cwd: 'src/courses/<%= grunt.option("moduleID") %>'
                    }
                ]
            },
            main: {
                files: [
                    {
                        expand: true,
                        src: ['**/*'],
                        dest: 'builds/<%= grunt.option("moduleID") %>/course/',
                        cwd: 'src/courses/<%= grunt.option("moduleID") %>'
                    },
                    {
                        expand: true,
                        src: ['src/core/js/scriptLoader.js'],
                        dest: 'builds/<%= grunt.option("moduleID") %>/adapt/js/',
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
                        dest: 'builds/<%= grunt.option("moduleID") %>/libraries/',
                        filter: 'isFile',
                        flatten: true
                    },
                    {
                        expand: true,
                        flatten: true,
                        src: ['src/theme/<%= grunt.option("theme") %>/fonts/**'],
                        dest: 'builds/<%= grunt.option("moduleID") %>/adapt/css/fonts/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        flatten: true,
                        src: ['src/theme/<%= grunt.option("theme") %>/assets/**'],
                        dest: 'builds/<%= grunt.option("moduleID") %>/adapt/css/assets/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        flatten: true,
                        src: ['src/components/**/assets/**'],
                        dest: 'builds/<%= grunt.option("moduleID") %>/assets/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        flatten: true,
                        src: ['src/extensions/**/assets/**'],
                        dest: 'builds/<%= grunt.option("moduleID") %>/assets/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        flatten: true,
                        src: ['src/extensions/adapt-contrib-spoor/required/*'],
                        dest: 'builds/<%= grunt.option("moduleID") %>/',
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
                    'src/theme/<%= grunt.option("theme") %>/less/*.less'
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
                    'builds/<%= grunt.option("moduleID") %>/adapt/css/adapt.css' : 'src/less/adapt.less'
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
                    include: "<%= grunt.option('theme') %>",
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
                    out: './builds/<%= grunt.option("moduleID") %>/adapt/js/adapt.min.js',
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
                    out: './builds/<%= grunt.option("moduleID") %>/adapt/js/adapt.min.js',
                    optimize:"uglify2"
                }
            }
        },

        watch: {
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
                    'src/courses/<%= grunt.option("moduleID") %>/**/*.json',
                    '!src/courses/<%= grunt.option("moduleID") %>/config.json'
                ],
                tasks : ['jsonlint', 'copy:courseJson'],
                options: {
                    spawn: false,
                },
            },
            configJson: {
                files: [
                    'src/courses/<%= grunt.option("moduleID") %>/config.json',
                    'src/theme/<%= grunt.option("theme") %>/theme.json'
                ],
                tasks : ['jsonlint', 'create-json-config'],
                options: {
                    spawn: false,
                },
            },
            courseAssets: {
                files: [
                    'src/courses/<%= grunt.option("moduleID") %>/**/*',
                    '!src/courses/<%= grunt.option("moduleID") %>/**/*.json',
                    '!src/courses/<%= grunt.option("moduleID") %>/config.json'
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
                    'src/theme/<%= grunt.option("theme") %>/fonts/**',
                    'src/theme/<%= grunt.option("theme") %>/assets/**',
                    'src/components/**/assets/**',
                    'src/extensions/**/assets/**'
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
                    base: 'builds/<%= grunt.option("moduleID") %>',
                    keepalive:true
                }
            },
            spoorOffline: {
                options: {
                    port: 9001,
                    base: 'builds/<%= grunt.option("moduleID") %>',
                    keepalive:true
                }
            }
        },

        adapt_insert_tracking_ids: {
            options: {
                courseFile: "src/courses/<%= grunt.option('moduleID') %>/en/course.json",
                blocksFile: "src/courses/<%= grunt.option('moduleID') %>/en/blocks.json"
            }
        },

        nightwatch: {
            options: {
                standalone: true,
                jar_url: 'http://selenium-release.storage.googleapis.com/2.40/selenium-server-standalone-2.40.0.jar'
            }
        },
    });

    grunt.loadNpmTasks('grunt-contrib-concat');

    // concatenates config.json and theme.json
    grunt.registerTask('create-json-config', 'Creating config.json', function() {
        var themeJsonFile = '';

        // find theme.json path
        grunt.file.recurse('src/theme/' + grunt.option("theme") + '/', function(abspath, rootdir, subdir, filename) {
            if (filename == 'theme.json') {
                themeJsonFile = rootdir;
                if(subdir) themeJsonFile += subdir;
                themeJsonFile += '/' + filename;
            }
        });

        if (themeJsonFile == '') grunt.fail.fatal("Unable to locate theme.json, please ensure a valid theme exists");

        var configJson = grunt.file.readJSON('src/courses/' + grunt.option("moduleID") + '/config.json');
        var themeJson = grunt.file.readJSON(themeJsonFile);

        // add theme props to config
        for (var prop in themeJson) configJson[prop] = themeJson[prop];

        grunt.file.write('builds/' + grunt.option("moduleID")  + '/course/config.json', JSON.stringify(configJson));
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

        function checkJsonIds() {
            var currentCourseFolder;
            // Go through each course folder inside the src/course directory
            grunt.file.expand({filter: "isDirectory"}, "src/courses" + grunt.option("moduleID") + "/*").forEach(function(path) {
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
                if (value > 1) {
                    hasDuplicateIds = true;
                    duplicateIds.push(key);
                }
            });
            if (hasDuplicateIds) grunt.fail.fatal("Oops, looks like you have some duplicate _ids: " + duplicateIds);
        }

        function checkIfOrphanedElementsExist(value, parentFileToCheck) {
            _.each(value, function(parentId) {
                if (parentId === "course") return;

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
            if (hasOrphanedParentIds) grunt.fail.fatal("Oops, looks like you have some orphaned objects: " + orphanedParentIds);
        }
        checkJsonIds();
    });

    grunt.registerTask('compile', ['bower', 'requirejs-bundle', 'requirejs:dev']);
    //grunt.registerTask('acceptance',['compile', 'concurrent:selenium']);

    grunt.loadNpmTasks('adapt-grunt-tracking-ids');
    grunt.registerTask('_tracking-insert', 'Used internally. DO NOT CALL DIRECTLY.', function(moduleID) {
        grunt.option("moduleID", moduleID);
        grunt.task.run('adapt_insert_tracking_ids');
    });

    grunt.registerTask('tracking-insert', '', function(moduleID) {
        if(moduleID) grunt.task.run('_tracking-insert:' + moduleID);
        else {
            var mods = config.modules;
            for (var i = 0; i < mods.length; i++) grunt.task.run('_tracking-insert:' + mods[i]);
        }
    });

    grunt.registerTask('_build', 'Used internally. DO NOT CALL DIRECTLY.', function(moduleID, devMode) {
		checkValidMod(moduleID);

        // use custom or default theme depending on grunt_config
        var customTheme = config.themes.custom[moduleID];
        var theme = (customTheme) ? customTheme : config.themes.default;

        grunt.option("moduleID", moduleID);
        grunt.option("theme", theme);

        writeln("");
        writeln("Building module " + grunt.option("moduleID")['cyan'] + " dev: " + devMode);
        writeln("Using theme " + grunt.option("theme")['cyan']);

        var buildProcessRelease = ['jsonlint', 'check-json', 'clean', 'copy', 'concat', 'less', 'handlebars', 'bower', 'requirejs-bundle', 'requirejs:compile', 'create-json-config'];
        var buildProcessDev = ['jsonlint', 'check-json', 'clean', 'copy', 'concat', 'less', 'handlebars', 'bower', 'requirejs-bundle', 'requirejs:dev', 'create-json-config'];

        grunt.task.run((!!devMode === true) ? buildProcessDev : buildProcessRelease);
    });

    grunt.registerTask('build', '', function(moduleID, devMode) {
        if(moduleID) grunt.task.run('_build:' + moduleID + ':false');
        else {
            var mods = config.modules;
            for (var i = 0; i < mods.length; i++) grunt.task.run('_build:' + mods[i] + ':false');
        }
    });

    grunt.registerTask('dev', '', function(moduleID) {
        if(moduleID) grunt.task.run(['_build:' + moduleID + ":true", "watch"]);
        else {
            var mods = config.modules;
            for (var i = 0; i < mods.length; i++) grunt.task.run('_build:' + mods[i] + ":true");
        }
    });

    grunt.registerTask('spy', '', function(moduleID) {
        checkValidMod(moduleID);

        // use custom or default theme depending on grunt_config
        var customTheme = config.themes.custom[moduleID];
        var theme = (customTheme) ? customTheme : config.themes.default;

        grunt.option("moduleID", moduleID);
        grunt.option("theme", theme);

        grunt.task.run('watch');
    });

    grunt.registerTask('server', '', function(moduleID, spoor) {
        checkValidMod(moduleID);

        grunt.option("moduleID", moduleID);
        grunt.task.run('concurrent:' + ((!!spoor === true) ? 'spoor' : 'server'));
    });

    grunt.registerTask('server-scorm', '', function(moduleID) {
        grunt.task.run('server:' + moduleID + ':true');
    });

    function checkValidMod(id) {
		if (!id) grunt.fatal("No module specified...");

        var mods = config.modules;
        var exists = false;
        for (var i = 0; i < mods.length; i++) {
            if(mods[i] === id) {
                exists = true;
                break;
            }
        }

        if(!exists) grunt.fatal("'" + id + "' not specified in grunt_config.json. Try again...");
    };

    // shorthand, wraps text
    function writeln(msg) { grunt.log.writeln(grunt.log.wraptext(80, msg)); }

    grunt.registerTask('default', '', function(moduleID) {
        writeln('');
        grunt.log.ok('No task specified. See below for a list of available tasks.');
        writeln('');
        writeln('Note: tasks are listed in blue, mandatory parameters are in red, and optional parameters are in purple.');
        writeln('');
        writeTask('build', '', ':mod', 'Builds a production ready/minified version of the specified module. If no module ID is specified, all modules are built.');
        writeTask('dev', '', ':mod', 'Creates a developer-friendly version of the specified module (including source maps). If no module ID is specified, all modules are built.');
        writeTask('spy', ':mod', '', 'Listens for changes to any files associated with the specified module, then performs the necessary actions to update the build.');
        writeTask('tracking-insert', '', ':mod', 'Inserts tracking identifiers (used in conjunction with SCORM). If no module ID is specified, tracking IDs are added for all modules.');
        writeTask('server', ':mod', '', 'Launches a stand-alone Node.JS web server and opens the specified course in your default web browser.');
        writeTask('server-scorm', ':mod', '', 'Same as server, but emulates a SCORM server to test the tracking of learner progress.');

		// FYI: colors = 'white', 'black', 'grey', 'blue', 'cyan',
		//				 'green', 'magenta', 'red', 'yellow', 'rainbow'
        function writeTask(name, mandParams, optParams, description) {
            writeln(name['cyan'].bold + mandParams['red'].bold + optParams['magenta']);
            writeln(description);
            writeln('');
        }
    });
};
