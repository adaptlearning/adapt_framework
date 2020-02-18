/**
 * This is a simple function to take the course's config.json
 * and append the config.json (or legacy theme.json and menu.json) from plugins folders
 */
var path = require("path");

module.exports = function(grunt) {

  grunt.registerTask('create-json-config', 'Creating config.json', function() {

    var jsonext = grunt.config('jsonext');

    var sourcedir = grunt.option('outputdir') || grunt.config('sourcedir');

    var configJson = grunt.file.readJSON(path.join(sourcedir, 'course/config.' + jsonext));

    var pluginTypes = ["components", "extensions", "menu", "theme"];

    //iterate through plugin types
    pluginTypes.forEach(function(pluginType) {
      //iterate through plugins in plugin type folder
      grunt.file.expand({
        filter: 'isDirectory'
      }, path.join(sourcedir, pluginType, '/*')).forEach(function(pluginPath) {
        var filePath;
        var pluginTypeFilePath = path.join(pluginPath, pluginType + ".json");
        var customConfigFilePath = path.join(pluginPath, "config.json");
        if (grunt.file.exists(pluginTypeFilePath)) {
          filePath = pluginTypeFilePath;
        } else if (grunt.file.exists(customConfigFilePath)) {
          filePath = customConfigFilePath;
        }

        if (!filePath) return;

        var customItemJson = grunt.file.readJSON(filePath);

        // This effectively combines the JSON
        for (var prop in customItemJson) {
          configJson[prop] = customItemJson[prop];
        }

      });

    });

    grunt.file.write(grunt.config('outputdir') + 'course/config.' + jsonext, JSON.stringify(configJson, null, 4));

  });

};
