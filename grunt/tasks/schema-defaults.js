module.exports = function(grunt) {
  grunt.registerTask('schema-defaults', 'Manufactures the course.json defaults', function() {
    var fs = require('fs');
    var path = require('path');
    var Helpers = require('../helpers')(grunt);

    //import underscore and underscore-deep-extend
    var _ = require('underscore');
    _.mixin({
      deepExtend: require('underscore-deep-extend')(_)
    });

    //list all plugin types
    var pluginTypes = ['components', 'extensions', 'menu', 'theme'];
    //list authoring tool plugin categories
    var pluginCategories = ['component', 'extension', 'menu', 'theme'];

    //setup defaults object
    var defaultsObject = {
      _globals: {}
    };
    var globalsObject = defaultsObject._globals;

    //iterate through plugin types
    _.each(pluginTypes, function(pluginType, pluginTypeIndex) {
      var pluginCategory = pluginCategories[pluginTypeIndex];

      //iterate through plugins in plugin type folder
      var pluginTypeGlob = path.join(grunt.config('sourcedir'), pluginType, '*');
      grunt.file.expand({
        filter: 'isDirectory'
      }, pluginTypeGlob).forEach(function(pluginPath) {
        var currentPluginPath = pluginPath;

        // if specific plugin has been specified with grunt.option, don't carry on
        if (!Helpers.isPathIncluded(pluginPath + '/')) return;

        var currentSchemaPath = path.join(currentPluginPath, 'properties.schema');
        var currentBowerPath = path.join(currentPluginPath, 'bower.json');

        if (!fs.existsSync(currentSchemaPath) || !fs.existsSync(currentBowerPath)) return;

        //read bower.json and properties.schema for current plugin
        var currentSchemaJson = grunt.file.readJSON(currentSchemaPath);
        var currentBowerJson = grunt.file.readJSON(currentBowerPath);

        if (!currentSchemaJson || !currentBowerJson) return;

        //get plugin name from schema
        var currentPluginName = currentBowerJson[pluginCategory];

        if (!currentPluginName || !currentSchemaJson.globals) return;

        //iterate through schema globals attributes
        _.each(currentSchemaJson.globals, function(item, attributeName) {
          //translate schema attribute into globals object
          var pluginTypeDefaults = globalsObject['_' + pluginType] = globalsObject['_' + pluginType] || {};
          var pluginDefaults = pluginTypeDefaults['_' + currentPluginName] = pluginTypeDefaults['_' + currentPluginName] || {};

          pluginDefaults[attributeName] = item['default'];
        });
      });
    });

    var jsonext = grunt.config('jsonext');

    var sourcedir = grunt.option('outputdir') || grunt.config('sourcedir');

    //iterate through language folders
    var languageFolderGlob = path.join(sourcedir, 'course/*');
    grunt.file.expand({
      filter: 'isDirectory'
    }, languageFolderGlob).forEach(function(languageFolderPath) {
      var currentCourseFolder = languageFolderPath;
      var currentCourseJsonFile = path.join(currentCourseFolder, 'course.' + jsonext);
      var outputDirCourseJson = currentCourseJsonFile.replace(path.basename(sourcedir), path.basename(grunt.config('outputdir')));

      // Read course json from build and overlay onto defaults object
      var currentCourseJson = _.deepExtend({}, defaultsObject, grunt.file.readJSON(outputDirCourseJson));

      // Write modified course json to build
      grunt.file.write(outputDirCourseJson, JSON.stringify(currentCourseJson, null, 4));
    });
  });
}
