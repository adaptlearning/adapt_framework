module.exports = function(grunt) {
    /*
    * Uses the parent folder name (menu, theme, components, extensions).
    * Also caches a list of the installed plugins
    * assumption: all folders are plugins
    */
    var getInstalledPluginsByType = function(type) {
        var pluginDir = grunt.config.get('sourcedir') + type + '/';
        if(!grunt.file.isDir(pluginDir)) return []; // fail silently
        // return all sub-folders, and save for later
        return grunt.option(type, grunt.file.expand({ filter:'isDirectory', cwd:pluginDir }, '*'));
    };

    var isPluginInstalled = function(pluginName) {
        var types = ['components','extensions','theme','menu'];
        for(var i = 0, len = types.length; i < len; i++) {
            var plugins = grunt.option(types[i]) || getInstalledPluginsByType(types[i]);
            if(plugins.indexOf(pluginName) !== -1) return true;
        }
        return false;
    }

    var isPluginExcluded = function(pluginType, pluginPath) {
        var optionVal = grunt.option(pluginType);
        var isExcluded = optionVal && pluginPath.indexOf(optionVal) === -1;
        return isExcluded;
    }

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

    require('load-grunt-config')(grunt, {
        data: {
            sourcedir: getSourceDir(),
            outputdir: getOutputDir(),
            theme: getTheme(),
            menu: getMenu(),
            pkg: grunt.file.readJSON('package.json'),
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
        var chalk = require('chalk'); // for some nice colouring

        var listOfCourseFiles = ['course', 'contentObjects', 'articles', 'blocks', 'components'];
        var listOfObjectTypes = ['course', 'menu', 'page', 'article', 'block', 'component' ];

        // Go through each course folder inside the <%= sourcedir %>course directory
        grunt.file.expand({filter: 'isDirectory'}, grunt.config.get('sourcedir') + 'course/*').forEach(function(path) {

            var courseItemObjects = [];

            // Go through each list of declared course files
            listOfCourseFiles.forEach(function(jsonFileName) {
                var currentJson = grunt.file.readJSON(path + '/' + jsonFileName + '.json');

                //collect all course items in a single array
                switch (jsonFileName) {
                case "course":
                    //course file is a single courseItemObject
                    courseItemObjects.push(currentJson);
                    break;
                default:
                    //all other files are arrays of courseItemObjects
                    courseItemObjects = courseItemObjects.concat(currentJson);
                    break;
                }

            });

            //index and group the courseItemObjects
            var idIndex = _.indexBy(courseItemObjects, "_id");
            var idGroups = _.groupBy(courseItemObjects, "_id");
            var parentIdGroups = _.groupBy(courseItemObjects, "_parentId");

            //setup error collection arrays
            var orphanedIds = [];
            var emptyIds = [];
            var duplicateIds = [];
            var missingIds = [];

            for (var i = 0, l = courseItemObjects.length; i < l; i++) {
                var contentObject = courseItemObjects[i];
                var id = contentObject._id;
                var parentId = contentObject._parentId;
                var typeName = contentObject._type;
                var typeIndex = listOfObjectTypes.indexOf(typeName);

                var isRootType = typeIndex === 0;
                var isBranchType = typeIndex < listOfObjectTypes.length - 1;
                var isLeafType = !isRootType && !isBranchType;

                if (!isLeafType) { //(course, contentObjects, articles, blocks)
                    if (parentIdGroups[id] === undefined) emptyIds.push(id); //item has no children
                }

                if (!isRootType) { //(contentObjects, articles, blocks, components)
                    if (idGroups[id].length > 1) duplicateIds.push(id); //id has more than one item
                    if (!parentId || idIndex[parentId] === undefined) orphanedIds.push(id); //item has no defined parent id or the parent id doesn't exist
                    if (idIndex[parentId] === undefined) missingIds.push(parentId); //referenced parent item does not exist
                }

            }

            //output only unique entries
            orphanedIds = _.uniq(orphanedIds);
            emptyIds = _.uniq(emptyIds);
            duplicateIds = _.uniq(duplicateIds);
            missingIds = _.uniq(missingIds);

            //output for each type of error
            var hasErrored = false;
            if (orphanedIds.length > 0) {
                hasErrored = true;
                grunt.log.writeln(chalk.yellow('Orphaned _ids: ' + orphanedIds));
            }

            if (missingIds.length > 0) {
                hasErrored = true;
                grunt.log.writeln(chalk.yellow('Missing _ids: ' + missingIds));
            }

            if (emptyIds.length > 0) {
                hasErrored = true;
                grunt.log.writeln(chalk.yellow('Empty _ids: ' + emptyIds));
            }

            if (duplicateIds.length > 0) {
                hasErrored = true;
                grunt.log.writeln(chalk.yellow('Duplicate _ids: ' + duplicateIds));
            }

            //if any error has occured, stop processing.
            if (hasErrored) {
                grunt.fail.fatal('Oops, looks like you have some json errors.');
            }

        });

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

    grunt.registerTask('server-build', 'Builds the course without JSON [used by the authoring tool]', function(mode) {
        var requireMode = (mode === 'dev') ? 'dev' : 'compile';
        var tasks = ['copy', 'concat', 'less', 'handlebars', 'bower', 'requirejs-bundle', 'requirejs:' + requireMode];
        grunt.task.run(tasks);
    });

    grunt.registerTask('_build', ['_log-vars','jsonlint', 'check-json', 'copy', 'concat', 'less', 'handlebars', 'bower', 'requirejs-bundle', 'create-json-config', 'schema-defaults', 'tracking-insert']);
    grunt.registerTask('build', 'Creates a production-ready build of the course', ['_build', 'requirejs:compile', 'clean:dist']);
    grunt.registerTask('dev', 'Creates a developer-friendly build of the course', ['_build', 'requirejs:dev', 'watch']);
    grunt.registerTask('server', 'Runs a local server using port 9001', ['_log-server', 'concurrent:server']);
    grunt.registerTask('server-scorm', 'Runs a SCORM test server using port 9001', ['_log-server', 'concurrent:spoor']);

    grunt.registerTask('tracking-insert', 'Adds any missing tracking IDs (starting at the highest existing ID)', function() {
        if(isPluginInstalled('adapt-contrib-spoor')) {
            grunt.task.run(['adapt_insert_tracking_ids']);
        }
    });
    grunt.registerTask('tracking-remove', 'Removes all tracking IDs', function() {
        if(isPluginInstalled('adapt-contrib-spoor')) {
            grunt.task.run(['adapt_remove_tracking_ids']);
        }
    });
    grunt.registerTask('tracking-reset', 'Resets and re-inserts all tracking IDs, starting with 0', function() {
        if(isPluginInstalled('adapt-contrib-spoor')) {
            grunt.task.run(['adapt_reset_tracking_ids']);
        }
    });

    grunt.registerTask('schema-defaults', 'Manufactures the course.json defaults', function() {
        var fs = require("fs");
        //import underscore and underscore-deep-extend
        var _ = require('underscore');
        _.mixin({deepExtend: require('underscore-deep-extend')(_) });

        //list all plugin types
        var pluginTypes = [ "components", "extensions", "menu", "theme" ];
        //list authoring tool plugin categories
        var pluginCategories = [ "component", "extension", "menu", "theme" ];

        //setup defaults object
        var defaultsObject = { _globals: {} };
        var globalsObject = defaultsObject._globals;

        //iterate through plugin types
        _.each(pluginTypes, function(pluginType, pluginTypeIndex) {
            var pluginCategory = pluginCategories[pluginTypeIndex];

            //iterate through plugins in plugin type folder
            grunt.file.expand({filter: 'isDirectory'}, grunt.config.get('sourcedir') + pluginType + '/*').forEach(function(path) {
                var currentPluginPath = path;

                // if specific plugin has been specified with grunt.option, don't carry on
                if(isPluginExcluded(pluginType, path)) return;

                var currentSchemaPath = currentPluginPath + "/" + "properties.schema";
                var currentBowerPath = currentPluginPath + "/" + "bower.json";

                if (!fs.existsSync(currentSchemaPath) || !fs.existsSync(currentBowerPath)) return;

                //read bower.json and properties.schema for current plugin
                var currentSchemaJson = grunt.file.readJSON(currentSchemaPath);
                var currentBowerJson  = grunt.file.readJSON(currentBowerPath);

                if (!currentSchemaJson || ! currentBowerJson) return;

                //get plugin name from schema
                var currentPluginName = currentBowerJson[pluginCategory];

                if (!currentPluginName || !currentSchemaJson.globals) return;

                //iterate through schema globals attributes
                _.each(currentSchemaJson.globals, function(item, attributeName) {
                    //translate schema attribute into globals object
                    var pluginTypeDefaults = globalsObject['_'+ pluginType] = globalsObject['_'+ pluginType] || {};
                    var pluginDefaults =  pluginTypeDefaults["_" + currentPluginName] = pluginTypeDefaults["_" + currentPluginName] || {};

                    pluginDefaults[attributeName] = item['default'];
                });
            });
        });

        //iterate through lanugage folders
        grunt.file.expand({filter: 'isDirectory'}, grunt.config.get('outputdir') + 'course/*').forEach(function(path) {
            var currentCourseFolder = path;
            var currentCourseJsonFile = currentCourseFolder + '/' + 'course.json';

            //read course json and overlay onto defaults object
            var currentCourseJson = _.deepExtend(defaultsObject, grunt.file.readJSON(currentCourseJsonFile));

            //write modified course json to build
            grunt.file.write(currentCourseJsonFile, JSON.stringify(currentCourseJson));
        });
    });

    /*
    * Lists out the available tasks along with their descriptions.
    * Tasks in the array below will not be listed.
    */
    grunt.registerTask('help', function() {
        var chalk = require('chalk'); // for some nice colouring
        var columnify = require('columnify'); // deals with formatting

        // the following tasks won't be shown
        var ignoredTasks = [
            'default',
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
            'adapt_reset_tracking_ids',
            'schema-defaults'
        ];

        grunt.log.writeln('');
        grunt.log.writeln(chalk.underline('Adapt Learning automated build process'));
        grunt.log.writeln('');
        grunt.log.writeln('See below for the list of available tasks:');
        grunt.log.writeln('');

        var taskData = {};
        var maxTaskLength = 0;
        var maxConsoleWidth = 75; // standard 80 chars + a buffer

        for(var key in grunt.task._tasks) {
            if(this.name !== key && -1 === ignoredTasks.indexOf(key)) {
                var task = grunt.task._tasks[key];
                taskData[chalk.cyan(task.name)] = task.info;
                if(task.name.length > maxTaskLength) maxTaskLength = task.name.length
            }
        }

        var options = {
            maxWidth: maxConsoleWidth - maxTaskLength,
            showHeaders: false,
            columnSplitter: '  '
        };

        // log everything
        grunt.log.writeln(columnify(taskData, options));

        grunt.log.writeln('');
        grunt.log.writeln('Run a task using: grunt [task name]');
        grunt.log.writeln('');
        grunt.log.writeln('For more information, see https://github.com/adaptlearning/adapt_framework/wiki');
    });

    grunt.registerTask('default', ['help']);

    grunt.loadNpmTasks('adapt-grunt-tracking-ids');
};
