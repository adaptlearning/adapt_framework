/**
* CGKineo Internal Adapt Gruntfile.js
* Authors: Thomas Taylor <thomas.taylor@kineo.com>, Gavin McMaster <gavin.mcmaster@kineo.com>, Tom Greenfield <tom.greenfield@kineo.com>
* version: 1.0
*/
module.exports = function(grunt) {
    require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);
    var chalk = require("chalk");
    var config = require("./grunt_config.json");

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),

        jsonlint: {
            all: ["src/courses/<%= grunt.option('courseFolder') %>/**/*.json"]
        },

        clean: {
            buildMod: ["builds/<%= grunt.option('moduleID') %>/"],
            buildAll: ["builds/"]
        },

        jshint: {
            options: {
                maxerr: 100,
                reporter: require("jshint-stylish"),
                force: true,
                freeze: true,
                undef: true,
                asi: true,
                eqnull: true,
                sub: true,
                expr: true,
                boss: true,
                laxbreak: true,
                browser: true,
                jquery: true,
                globals: {
                    "define": false,
                    "require": false,
                    "console": false,
                    "_": false,
                    "Backbone": false,
                    "Handlebars": false,
                    "Modernizr": false
                }
            },
            core: ["src/core/**/*.js", "!src/core/js/libraries/*.js"],
            menu: ["src/menu/**/js/*.js"],
            theme: ["src/theme/**/js/*.js"],
            extensions: ["src/extensions/**/js/*.js", "!**/**/*.min.js"],
            components: ["src/components/**/js/*.js", "!**/**/*.min.js"]
        },

        copy: {
            index: {
                files: [
                    {
                        expand: true,
                        src: ["src/index.html"],
                        dest: "builds/<%= grunt.option('moduleID') %>",
                        filter: "isFile",
                        flatten: true
                    },
                ]
            },
            courseJson: {
                files: [
                    {
                        expand: true,
                        src: ["**/*.json", "!**/config.json"],
                        dest: "builds/<%= grunt.option('moduleID') %>/course/",
                        cwd: "src/courses/<%= grunt.option('courseFolder') %>"
                    }
                ]
            },
            courseAssets: {
                files: [
                    {
                        expand: true,
                        src: ["**/*","!**/*.json","!imsmanifest.xml"],
                        dest: "builds/<%= grunt.option('moduleID') %>/course/",
                        cwd: "src/courses/<%= grunt.option('courseFolder') %>"
                    }
                ]
            },
            main: {
                files: [
                    {
                        expand: true,
                        flatten: true,
                        src: ["src/extensions/adapt-contrib-spoor/required/*"],
                        dest: "builds/<%= grunt.option('moduleID') %>/",
                        filter: function(filepath) {
                            return excludedFilter(filepath);
                        }
                    },
                    {
                        expand: true,
                        src: ["**/*", '!imsmanifest.xml'],
                        dest: "builds/<%= grunt.option('moduleID') %>/course/",
                        cwd: "src/courses/<%= grunt.option('courseFolder') %>"
                    },
                    {
                        expand: true,
                        src: "imsmanifest.xml",
                        dest: "builds/<%= grunt.option('moduleID') %>/",
                        cwd: "src/courses/<%= grunt.option('moduleID') %>"
                    },
                    {
                        expand: true,
                        src: ["src/core/js/scriptLoader.js"],
                        dest: "builds/<%= grunt.option('moduleID') %>/adapt/js/",
                        filter: "isFile",
                        flatten: true
                    },
                    {
                        expand: true,
                        src: [
                            "src/core/js/libraries/require.js",
                            "src/core/js/libraries/modernizr.js",
                            "src/core/js/libraries/json2.js",
                            "src/core/js/libraries/consoles.js",
                            "src/core/js/libraries/swfObject.js"
                        ],
                        dest: "builds/<%= grunt.option('moduleID') %>/libraries/",
                        filter: "isFile",
                        flatten: true
                    },
                    {
                        expand: true,
                        flatten: true,
                        src: ["src/theme/<%= grunt.option('theme') %>/fonts/**"],
                        dest: "builds/<%= grunt.option('moduleID') %>/adapt/css/fonts/",
                        filter: "isFile"
                    },
                    {
                        expand: true,
                        flatten: true,
                        src: ["src/theme/<%= grunt.option('theme') %>/assets/**"],
                        dest: "builds/<%= grunt.option('moduleID') %>/adapt/css/assets/",
                        filter: "isFile"
                    },
                    {
                        expand: true,
                        flatten: true,
                        src: ["src/components/**/assets/**"],
                        dest: "builds/<%= grunt.option('moduleID') %>/assets/",
                        filter: function(filepath) {
                            return excludedFilter(filepath);
                        }
                    },
                    {
                        expand: true,
                        flatten: true,
                        src: ["src/extensions/**/assets/**"],
                        dest: "builds/<%= grunt.option('moduleID') %>/assets/",
                        filter: function(filepath) {
                            return excludedFilter(filepath);
                        }
                    }
                ]
            }
        },

        concat: {
            less: {
                src: [
                    "src/core/less/*.less",
                    "src/menu/**/*.less",
                    "src/components/**/*.less",
                    "src/extensions/**/*.less",
                    "src/theme/<%= grunt.option('theme') %>/less/*.less"
                ],
                dest: "src/less/adapt.less"
            },
            options: {
                process: function(content, filepath) {
                    return excludedProcess(content, filepath);
                }
            }
        },

        less: {
            options:{
                compress:true
            },
            dist: {
                files: {
                    "builds/<%= grunt.option('moduleID') %>/adapt/css/adapt.css" : "src/less/adapt.less"
                }
            }
        },

        handlebars: {
            compile: {
                options: {
                    amd: 'handlebars',
                    namespace:"Handlebars.templates",
                    partialRegex: /.*/,
                    partialsPathRegex: /\/partials\//,
                    processContent: function(content, filename) {
                        return excludedProcess(content, filename);
                    },
                    processName: function(filePath) {
                        var newFilePath = filePath.split("/");
                        newFilePath = newFilePath[newFilePath.length - 1].replace(/\.[^/.]+$/, "");
                        return  newFilePath;
                    }
                },
                files: {
                    "src/templates/templates.js": "src/**/*.hbs"
                }
            }
        },

        bower: {
            target: {
                rjsConfig: "./config.js",
                options: {
                    baseUrl: "src"
                }
            }
        },

        "requirejs-bundle": {
            components: {
                src: "src/components",
                dest: "src/components/components.js",
                options: {
                    baseUrl: "src",
                    moduleName: "components/components"
                }
            },
            extensions: {
                src: "src/extensions/",
                dest: "src/extensions/extensions.js",
                options: {
                    baseUrl: "src",
                    moduleName: "extensions/extensions"
                }
            },
            menu: {
                src: "src/menu/",
                dest: "src/menu/menu.js",
                options: {
                    baseUrl: "src",
                    moduleName: "menu/menu"
                }
            },
            theme: {
                src: "src/theme/",
                dest: "src/theme/theme.js",
                options: {
                    include: "<%= grunt.option('theme') %>",
                    baseUrl: "src",
                    moduleName: "themes/themes"
                }
            }
        },

        requirejs: {
            dev: {
                options: {
                    name: "core/js/app",
                    baseUrl: "src",
                    mainConfigFile: "./config.js",
                    out: "./builds/<%= grunt.option('moduleID') %>/adapt/js/adapt.min.js",
                    generateSourceMaps: true,
                    preserveLicenseComments:false,
                    optimize: "none",
                    onBuildRead: function(moduleName, path, contents) {
                        return excludedProcess(contents, path);
                    }
                }
            },
            compile: {
                options: {
                    name: "core/js/app",
                    baseUrl: "src",
                    mainConfigFile: "./config.js",
                    out: "./builds/<%= grunt.option('moduleID') %>/adapt/js/adapt.min.js",
                    optimize:"uglify2"
                }
            }
        },

        watch: {
            less: {
                files: ["src/**/*.less"],
                tasks: ["less-sourcemaps"],
                options: {
                    spawn: false,
                },
            },
            handlebars: {
                files: ["src/**/*.hbs"],
                tasks: ["handlebars", "compile"],
                options: {
                    spawn: false,
                },
            },
            courseJson: {
                files: [
                    "src/courses/<%= grunt.option('courseFolder') %>/**/*.json",
                    "!src/courses/<%= grunt.option('courseFolder') %>/config.json"
                ],
                tasks : ["jsonlint", "copy:courseJson"],
                options: {
                    spawn: false,
                },
            },
            configJson: {
                files: [
                    "src/courses/<%= grunt.option('courseFolder') %>/config.json",
                    "src/theme/<%= grunt.option('theme') %>/theme.json"
                ],
                tasks : ["jsonlint", "create-json-config"],
                options: {
                    spawn: false,
                },
            },
            courseAssets: {
                files: [
                    "src/courses/<%= grunt.option('courseFolder') %>/**/*",
                    "!src/courses/<%= grunt.option('courseFolder') %>/**/*.json",
                    "!src/courses/<%= grunt.option('courseFolder') %>/config.json"
                ],
                tasks : ["copy:courseAssets"],
                options: {
                    spawn: false,
                },
            },
            js: {
                files: [
                    "src/**/*.js",
                    "!src/components/components.js",
                    "!src/extensions/extensions.js",
                    "!src/menu/menu.js",
                    "!src/theme/theme.js",
                    "!src/templates/templates.js",
                ],
                tasks: ["compile"],
                options: {
                    spawn: false,
                },
            },
            index: {
                files: ["src/index.html"],
                tasks: ["copy:index"],
                options: {
                    spawn: false,
                },
            },
            assets: {
                files: [
                    "src/theme/<%= grunt.option('theme') %>/fonts/**",
                    "src/theme/<%= grunt.option('theme') %>/assets/**",
                    "src/components/**/assets/**",
                    "src/extensions/**/assets/**"
                ],
                tasks: ["copy:main"],
                options: {
                    spawn: false,
                },
            }
        },

        open: {
            server: {
                path: "http://localhost:<%= connect.server.options.port %>/"
            },
            spoor: {
                path: "http://localhost:<%= connect.server.options.port %>/main.html"
            }
        },

        concurrent: {
            server: ["connect:server", "open:server"],
            spoor: ["connect:spoorOffline", "open:spoor"],
            selenium: ["connect:spoorOffline", "nightwatch"]
        },

        connect: {
            server: {
                options: {
                    port: 9001,
                    base: "builds/<%= grunt.option('moduleID') %>",
                    keepalive:true
                }
            },
            spoorOffline: {
                options: {
                    port: 9001,
                    base: "builds/<%= grunt.option('moduleID') %>",
                    keepalive:true
                }
            }
        },

        adapt_reset_tracking_ids: {
            options: {
                courseFile: "src/courses/<%= grunt.option('courseFolder') %>/en/course.json",
                blocksFile: "src/courses/<%= grunt.option('courseFolder') %>/en/blocks.json"
            }
        },

        nightwatch: {
            options: {
                standalone: true,
                jar_url: "http://selenium-release.storage.googleapis.com/2.40/selenium-server-standalone-2.40.0.jar"
            }
        },
    });

    // exclude components/extensions found in grunt_config->custom->excludes
    var isPathExcluded = function(path) {
        var custConfig = config.custom[grunt.option("moduleID")];
        var excludes = (custConfig) ? custConfig.excludes : [];
        var pathMod = require("path");
        var dirs = pathMod.normalize(path).split(pathMod.sep);

        for(var i = 0; i < excludes.length; i++) {
            var index = require("underscore").indexOf(dirs, excludes[i]);
            if(index !== -1) {
                writeln("Excluded " + chalk.cyan(dirs[dirs.length-1]));
                return true;
            }
        }
        return false;
    };

    var excludedFilter = function(filepath) {
        return !isPathExcluded(filepath);
    };
    // for where filter isn't supported...
    var excludedProcess = function(content, filepath) {
        if(isPathExcluded(filepath)) return "";
        else return content;
    };

    var setGlobalVariables = function(moduleID) {
        var custConfig = config.custom[moduleID];

        // use custom or default theme depending on grunt_config
        var customTheme = (custConfig) ? custConfig.theme : undefined;
        var theme = (customTheme) ? customTheme : config.defaults.theme;

        // determine the course folder to use
        var customCourseFolder = (custConfig) ? custConfig.course : undefined;
        var courseFolder = (customCourseFolder) ? customCourseFolder : moduleID;

        grunt.option("courseFolder", courseFolder);
        grunt.option("moduleID", moduleID);
        grunt.option("theme", theme);
    };

    grunt.loadNpmTasks("grunt-contrib-concat");

    // concatenates config.json and theme.json
    grunt.registerTask("create-json-config", "Creating config.json", function() {
        var themeJsonFile = "";

        // find theme.json path
        grunt.file.recurse("src/theme/" + grunt.option("theme") + "/", function(abspath, rootdir, subdir, filename) {
            if (filename === "theme.json") {
                themeJsonFile = rootdir;
                if(subdir) themeJsonFile += subdir;
                themeJsonFile += "/" + filename;
            }
        });

        if (themeJsonFile == "") grunt.fail.fatal("Unable to locate theme.json, please ensure a valid theme exists");

        var configJson = grunt.file.readJSON("src/courses/" + grunt.option("courseFolder") + "/config.json");
        var themeJson = grunt.file.readJSON(themeJsonFile);

        // add theme props to config
        for (var prop in themeJson) configJson[prop] = themeJson[prop];

        grunt.file.write("builds/" + grunt.option("moduleID")  + "/course/config.json", JSON.stringify(configJson));
    });

    grunt.registerTask("check-json", "Checking course.json", function() {
        var _ = require("underscore");
        var listOfCourseFiles = ["course", "contentObjects", "articles", "blocks", "components"];
        var currentJsonFile;
        var storedIds = [];
        var storedFileParentIds = {};
        var storedFileIds = {};
        var hasOrphanedParentIds = false;
        var orphanedParentIds = [];
        var courseId;

        function checkJsonIds() {
            var currentCourseFolder;
            // Go through each course folder inside the src/course directory
            grunt.file.expand({filter: "isDirectory"}, "src/courses/" + grunt.option("courseFolder") + "/*").forEach(function(path) {
                // Stored current path of folder - used later to read .json files
                currentCourseFolder = path;
                // Go through each list of declared course files
                listOfCourseFiles.forEach(function(jsonFileName) {
                    var currentJsonFile = grunt.file.readJSON(currentCourseFolder + "/" + jsonFileName + ".json");
                    // Set course ID
                    if (jsonFileName === "course") {
                        courseId = currentJsonFile._id;
                    } else {
                        storedFileParentIds[jsonFileName] = [];
                        storedFileIds[jsonFileName] = [];
                        // Read each .json file
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
                if (parentId === courseId) return;

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

    grunt.registerTask("compile", ["bower", "requirejs-bundle", "requirejs:dev"]);
    //grunt.registerTask("acceptance",["compile", "concurrent:selenium"]);

    grunt.loadNpmTasks("adapt-grunt-tracking-ids");
    grunt.registerTask("_tracking-insert", "Used internally. DO NOT CALL DIRECTLY.", function(moduleID) {
        checkValidMod(moduleID);
        grunt.task.run("adapt_reset_tracking_ids");
    });

    grunt.registerTask("tracking-insert", "", function(moduleID) {
        setGlobalVariables(moduleID);
        if (moduleID) grunt.task.run("_tracking-insert:" + moduleID);
        else gruntAllMods("_tracking-insert");
    });

    var isDevMode = false;
    grunt.registerTask("_build", "Used internally. DO NOT CALL DIRECTLY.", function(moduleID, devMode) {
        checkValidMod(moduleID);

        setGlobalVariables(moduleID);

        devMode = (devMode === "true");

        writeln("");
        writeln("Building module " + chalk.cyan(grunt.option("moduleID")) + ((grunt.option("courseFolder") !== grunt.option("moduleID")) ? " [" + grunt.option("courseFolder") + "]" : "") + (devMode ? " (dev mode)" : ""));
        writeln("Using theme " + chalk.cyan(grunt.option("theme")));

        var buildProcessRelease = ["jsonlint", "check-json", "clean:buildMod", "copy", "less-sourcemaps", "handlebars", "bower", "requirejs-bundle", "requirejs:compile", "create-json-config"];
        var buildProcessDev = ["jsonlint", "check-json", "clean:buildMod", "copy", "less-sourcemaps", "handlebars", "bower", "requirejs-bundle", "requirejs:dev", "create-json-config"];

        isDevMode = devMode;
        grunt.task.run(devMode ? buildProcessDev : buildProcessRelease);
    });

    grunt.registerTask("build", "", function(moduleID) {
        if (moduleID) {
            grunt.task.run("_build:" + moduleID + ":false");
        }
        else {
            grunt.task.run(["clean:buildAll"]);
            gruntAllMods("_build", ":false");
        }
    });

    grunt.registerTask("dev", "", function(moduleID) {
        if (moduleID) {
            grunt.task.run(["_build:" + moduleID + ":true", "watch:" + moduleID]);
        }
        else {
            grunt.task.run(["clean:buildAll"]);
            gruntAllMods("_build", ":true");
        }
    });

    grunt.renameTask("watch", "contrib-watch");
    grunt.registerTask("watch", "", function(moduleID) {
        checkValidMod(moduleID);

        setGlobalVariables(moduleID);

        grunt.renameTask("contrib-watch", "watch");
        grunt.task.run("watch");
    });

    grunt.registerTask("server", "", function(moduleID, spoor) {
        checkValidMod(moduleID);

        setGlobalVariables(moduleID);

        grunt.task.run("concurrent:" + ((spoor === "true") ? "spoor" : "server"));
    });

    grunt.registerTask("server-scorm", "", function(moduleID) {
        grunt.task.run("server:" + moduleID + ":true");
    });

    function checkValidMod(id) {
        if (!id) grunt.fatal("No module specified...");

        var dirExists = grunt.file.exists("src/courses", id);
        var custConfig = config.custom[id];

        if (!dirExists && !custConfig) grunt.fatal("'" + id + "' directory not found, and no custom entry in grunt_config.json. Try again...");
    };

    function gruntAllMods(task, suffix) {
        if(typeof suffix === "undefined") suffix = "";
        grunt.file.expand({ filter: "isDirectory", cwd: "src/courses/" }, "*").forEach(function(moduleID) {
            grunt.task.run(task + ":" + moduleID + suffix);
        });

        // now for custom courses...
        for(var course in config.custom) {
            if(!grunt.file.exists("src/courses", course)) {
                grunt.task.run(task + ":" + course + suffix);
            }
        }
    };

    // shorthand, wraps text
    function writeln(msg) { grunt.log.writeln(grunt.log.wraptext(80, msg)); }

    grunt.registerTask('less-sourcemaps', 'Aligning sourcemaps', function() {

        var done = this.async();

        var _ = require('underscore');

        var gulp = require("gulp");
        var gulpif = require('gulp-if');
        var minifyCSS = require('gulp-minify-css');
        var concat = require("gulp-concat");
        var less = require("gulp-less");
        var sourcemaps = require("gulp-sourcemaps");

        return gulp
            .src([
                    'src/core/less/*.less',
                    'src/menu/**/*.less',
                    'src/components/**/*.less',
                    'src/extensions/**/*.less',
                    'src/theme/**/*.less'
                ], { base: "." })

                .pipe(gulpif(isDevMode,sourcemaps.init()))

                .pipe(concat( "adapt.css" ))

                .pipe(
                    less()
                )

                .on('error', function (error) {
                    grunt.fail.warn(error.message);
                    done(false);
                    this.emit('end');
                })

                .pipe(gulpif(!isDevMode, minifyCSS()))

                .pipe(gulpif(isDevMode, sourcemaps.write("./") ) )


                .pipe(gulp.dest("builds/"+grunt.option("moduleID")+"/adapt/css")).on("end", function () {
                     //redo source map paths so that they end up in the right place in the browser
                    if (isDevMode) {
                        var mapFile = grunt.file.readJSON("builds/"+grunt.option("moduleID")+"/adapt/css/adapt.css.map");
                        delete mapFile.sourceRoot;
                        _.each(mapFile.sources, function(item, index) { 
                            mapFile.sources[index]  = item.replace(/\\/g, "/").replace(/src\//g, "" );
                        });
                        grunt.file.write("builds/"+grunt.option("moduleID")+"/adapt/css/adapt.css.map", JSON.stringify(mapFile, null,4));
                    }
                    done(true);
                });
    });


    grunt.registerTask("default", "", function(moduleID) {
        writeln("");
        writeln(chalk.yellow("No task specified. See below for a list of available tasks."));
        writeln("");
        writeln("Note: tasks are listed in " + chalk.cyan("blue") + ", mandatory parameters are in " + chalk.red("red") + ", and optional parameters are in " + chalk.magenta("magenta") + ".");
        writeln("");
        writeTask("build", "", ":mod", "Builds a production ready/minified version of the specified module. If no module ID is specified, all modules are built.");
        writeTask("dev", "", ":mod", "Creates a developer-friendly version of the specified module (including source maps). If no module ID is specified, all modules are built.");
        writeTask("jshint", "", "", "Runs JSHint on the src folder. Options are pretty lax, so don't depend on this too heavily.");
        writeTask("watch", ":mod", "", "Listens for changes to any files associated with the specified module, then performs the necessary actions to update the build.");
        writeTask("tracking-insert", "", ":mod", "Inserts tracking identifiers (used in conjunction with SCORM). If no module ID is specified, tracking IDs are added for all modules.");
        writeTask("server", ":mod", "", "Launches a stand-alone Node.JS web server and opens the specified course in your default web browser.");
        writeTask("server-scorm", ":mod", "", "Same as server, but emulates a SCORM server to test the tracking of learner progress.");

        function writeTask(name, mandParams, optParams, description) {
            writeln(chalk.cyan(name) + chalk.red.bold(mandParams) + chalk.magenta(optParams));
            writeln(description);
            writeln("");
        }
    });
};
