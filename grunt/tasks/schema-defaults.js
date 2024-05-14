module.exports = function(grunt) {
  const Helpers = require('../helpers')(grunt);
  grunt.registerTask('schema-defaults', 'Manufactures the course.json _globals defaults', function() {
    const framework = Helpers.getFramework({ useOutputData: true });
    const schemas = framework.getSchemas({ includedFilter: framework.includedFilter });
    const data = framework.getData(framework.useOutputData);
    framework.applyGlobalsDefaults({ schemas, data });
    framework.applyScreenSizeDefaults({ schemas, data });
  });
};
