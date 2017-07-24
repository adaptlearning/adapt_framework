

module.exports = function(grunt) {

    var Helpers = require('../helpers')(grunt);
    var path = require('path');

    grunt.registerTask('build-config', 'Create build config file', function() {
        var done = this.async();
        var options = this.options({});

        // TODO: save buildConfig with relevant bits
        var data = Helpers.generateConfigData();
        var buildConfigPath = path.join(data.outputdir, "adapt/js/build.js");

        data.plugins = [];
        grunt.file.expand({follow: true}, options.src).forEach(function(bowerJSONPath) {
            var plugin = grunt.file.readJSON(bowerJSONPath);
            data.plugins.push(plugin);
        });

        data.package = grunt.file.readJSON(path.join(data.root, 'package.json'));

        var hideAttributes = [ 'outputdir', 'sourcedir', 'root' ];
        hideAttributes.forEach(function(attrName) { delete data[attrName]; });

        grunt.file.write(buildConfigPath, JSON.stringify(data, null, "  "));

        done();

    });

};