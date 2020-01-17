module.exports = function(grunt) {

  var Helpers = require('../helpers')(grunt);
  var path = require('path');
  var _ = require('underscore');

  grunt.registerTask('build-config', 'Create build config file', function() {
    var options = this.options({});

    var buildConfig = Helpers.generateConfigData();
    var buildConfigPath = path.join(buildConfig.outputdir, "adapt/js/build.min.js");

    var allowedProperties = options.allowedProperties || {};

    // add package json
    buildConfig.package = grunt.file.readJSON(path.join(buildConfig.root, 'package.json'));
    if (allowedProperties.package) {
      buildConfig.package = _.pick(buildConfig.package, allowedProperties.package);
    }

    // add bower json
    buildConfig.plugins = [];
    grunt.file.expand({
      follow: true,
      filter: options.filter
    }, options.src).forEach(function(bowerJSONPath) {
      var plugin = grunt.file.readJSON(bowerJSONPath);
      if (allowedProperties.bower) {
        plugin = _.pick(plugin, allowedProperties.bower);
      }
      buildConfig.plugins.push(plugin);
    });

    // remove path specific variables
    var hideAttributes = ['outputdir', 'sourcedir', 'root'];
    hideAttributes.forEach(function(attrName) {
      delete buildConfig[attrName];
    });

    grunt.file.write(buildConfigPath, JSON.stringify(buildConfig));

  });

};
