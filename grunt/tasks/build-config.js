module.exports = function(grunt) {

  const Helpers = require('../helpers')(grunt);
  const path = require('path');
  const _ = require('underscore');

  grunt.registerTask('build-config', 'Create build config file', function() {
    const options = this.options({});

    const buildConfig = Helpers.generateConfigData();
    const buildConfigPath = path.join(buildConfig.outputdir, 'adapt/js/build.min.js');

    const allowedProperties = options.allowedProperties || {};

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
    const hideAttributes = [
      'cachepath',
      'configdir',
      'outputdir',
      'root',
      'sourcedir',
      'tempdir'
    ];
    hideAttributes.forEach(function(attrName) {
      delete buildConfig[attrName];
    });

    grunt.file.write(buildConfigPath, JSON.stringify(buildConfig));

  });

};
