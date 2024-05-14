/**
 * For the authoring tool
 */
module.exports = function(grunt) {
  const fs = require('fs-extra');

  grunt.registerTask('server-diff', 'Differential builds the course without JSON [used by the authoring tool]', function(mode) {
    const requireMode = (mode === 'dev') ? 'dev' : 'compile';

    const outputdir = grunt.config('outputdir');
    const buildFilePath = `${outputdir}/adapt/js/build.min.js`;
    let force = false;
    if (fs.existsSync(buildFilePath)) {
      const buildJSON = fs.readJSONSync(buildFilePath);
      force = (buildJSON.type === 'development' && requireMode !== 'dev') ||
        (buildJSON.type === 'production' && requireMode !== 'compile');
    }

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
      'clean:temp',
      requireMode === 'compile' && 'newer:terser:minify'
    ].filter(Boolean).map(item => {
      if (!force) return item;
      return item.replace('newer:', '');
    }));
  });
};
