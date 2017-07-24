

module.exports = function(grunt) {

    var Helpers = require('../helpers')(grunt);
    var path = require('path');

    grunt.registerTask('build-config', 'Create build config file', function() {
        var options = this.options({});

        var buildConfig = Helpers.generateConfigData();
        var buildConfigPath = path.join(buildConfig.outputdir, "adapt/js/build.js");

        // add package json
        buildConfig.package = grunt.file.readJSON(path.join(buildConfig.root, 'package.json'));

        // add bower json
        buildConfig.plugins = [];
        grunt.file.expand({follow: true}, options.src).forEach(function(bowerJSONPath) {
            var plugin = grunt.file.readJSON(bowerJSONPath);
            buildConfig.plugins.push(plugin);
        });

        // remove path specific variables
        var hideAttributes = [ 'outputdir', 'sourcedir', 'root' ];
        hideAttributes.forEach(function(attrName) { delete buildConfig[attrName]; });

        grunt.file.write(buildConfigPath, JSON.stringify(buildConfig, null, 2));

    });

};