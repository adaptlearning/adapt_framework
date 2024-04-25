/**
 * For development
 */
module.exports = function(grunt) {
  const fs = require('fs-extra');

  grunt.registerTask('diff', 'Differential compile on a developer-friendly build of the course', function(mode) {
    const requireMode = (mode === 'build') ? 'compile' : 'dev';

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
      'check-json',
      'build-config',
      'tracking-insert',
      'newer:copy:courseAssets',
      'newer:copy:courseJson',
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
      'newer:handlebars:compile',
      'newer:javascript:dev',
      'newer:less:dev',
      'replace',
      'scripts:adaptpostbuild',
      'clean:temp',
      requireMode === 'compile' && 'json-minify:minify',
      requireMode === 'compile' && 'newer:terser:minify'
    ].filter(Boolean).map(item => {
      if (!force) return item;
      return item.replace('newer:', '');
    }));
  });
};
