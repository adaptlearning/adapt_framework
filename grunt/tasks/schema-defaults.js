module.exports = function(grunt) {
    grunt.registerTask('schema-defaults', 'Manufactures the course.json defaults', function() {
        var fs = require("fs");
        var Helpers = require('../helpers')(grunt);

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
            grunt.file.expand({filter: 'isDirectory'}, grunt.config('sourcedir') + pluginType + '/*').forEach(function(path) {
                var currentPluginPath = path;

                // if specific plugin has been specified with grunt.option, don't carry on
                if (!Helpers.isPluginIncluded(path)) return;

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
        grunt.file.expand({filter: 'isDirectory'}, grunt.config('outputdir') + 'course/*').forEach(function(path) {
            var currentCourseFolder = path;
            var currentCourseJsonFile = currentCourseFolder + '/' + 'course.json';

            //read course json and overlay onto defaults object
            var currentCourseJson = _.deepExtend(defaultsObject, grunt.file.readJSON(currentCourseJsonFile));

            //write modified course json to build
            grunt.file.write(currentCourseJsonFile, JSON.stringify(currentCourseJson));
        });
    });
}
