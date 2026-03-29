module.exports = function(grunt) {
  const Helpers = require('../helpers')(grunt);
  grunt.registerTask('check-plugins', 'Checks that only one theme and one menu are active in the build', function() {
    const excludes = grunt.config('excludes') || [];
    const singletonTypes = ['theme', 'menu'];

    singletonTypes.forEach(function(type) {
      const installed = Helpers.getInstalledPluginsByType(type);
      const active = installed.filter(name => !excludes.includes(name));

      if (active.length <= 1) return;

      grunt.fail.fatal(
        `More than one ${type} is active in this build: ${active.join(', ')}.\n` +
        `Add the extras to build.excludes in config.json, e.g.:\n` +
        `  "build": { "excludes": ["${active.slice(1).join('", "')}"] }`
      );
    });
  });
};
