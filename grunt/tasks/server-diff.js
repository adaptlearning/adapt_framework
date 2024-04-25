/**
 * For the authoring tool
 */
module.exports = function(grunt) {
  grunt.registerTask('server-diff', 'Differential builds the course without JSON [used by the authoring tool]', function(mode) {
    const requireMode = (mode === 'dev') ? 'dev' : 'compile';

    grunt.task.run([
      '_log-vars',
      'build-config',
      'newer:copy:coreAssets',
      'newer:copy:componentAssets',
      'newer:copy:componentFonts',
      'newer:copy:extensionAssets',
      'newer:copy:extensionFonts',
      'newer:copy:menuAssets',
      'newer:copy:coreFonts',
      'newer:copy:menuFonts',
      'newer:copy:themeAssets',
      'newer:copy:themeFonts',
      'newer:copy:coreLibraries',
      'newer:copy:libraries',
      'copy:coreRequired',
      'copy:required',
      'scripts:adaptpostcopy',
      'schema-defaults',
      'language-data-manifests',
      'newer:less:' + requireMode,
      'newer:handlebars',
      'newer:javascript:' + requireMode,
      'replace',
      'scripts:adaptpostbuild',
      'clean:temp'
    ]);
  });
};
