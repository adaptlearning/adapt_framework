module.exports = function(grunt) {

  var Helpers = require('../helpers')(grunt);
  var path = require('path');
  var _ = require('underscore');

  grunt.registerTask('build-config', 'Create build config file', function() {
    var options = this.options({});

    var buildConfig = Helpers.generateConfigData();
    var buildConfigPath = path.join(buildConfig.outputdir, 'adapt/js/build.min.js');

    var allowedProperties = options.allowedProperties || {};

    const framework = Helpers.getFramework();

    // add package json
    buildConfig.package = framework.getPackageJSONFileItem().item;
    if (allowedProperties.package) {
      buildConfig.package = _.pick(buildConfig.package, allowedProperties.package);
    }

    // add bower json
    const plugins = framework.getPlugins();
    buildConfig.plugins = plugins.getAllPackageJSONFileItems().map(({ item }) => {
      if (allowedProperties.bower) {
        item = _.pick(item, allowedProperties.bower);
      }
      return item;
    });

    // remove path specific variables
    var hideAttributes = ['outputdir', 'sourcedir', 'root'];
    hideAttributes.forEach(function(attrName) {
      delete buildConfig[attrName];
    });

    grunt.file.write(buildConfigPath, JSON.stringify(buildConfig));

  });

};
