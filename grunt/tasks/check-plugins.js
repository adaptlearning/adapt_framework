module.exports = function(grunt) {
  const Helpers = require('../helpers')(grunt);
  grunt.registerTask('check-plugins', 'Checks that only one theme is active in the build', function() {
    // A specific theme was selected via CLI flag (e.g. --theme=X),
    // so only that one will be compiled regardless of what's installed
    if (grunt.config('theme') !== '**') return;

    const includes = grunt.config('includes');
    const excludes = [
      ...(grunt.config('excludes') || []),
      ...(grunt.config('type') === 'production' ? (grunt.config('productionExcludes') || []) : [])
    ];

    const installed = Helpers.getInstalledPluginsByType('theme');
    const active = includes
      ? installed.filter(name => includes.includes(name))
      : installed.filter(name => !excludes.includes(name));

    if (active.length <= 1) return;

    grunt.fail.fatal(
      `More than one theme is active in this build: ${active.join(', ')}.\n` +
      `Add the extras to build.excludes in config.json, e.g.:\n` +
      `  "build": { "excludes": ["${active.slice(1).join('", "')}"] }`
    );
  });
};
