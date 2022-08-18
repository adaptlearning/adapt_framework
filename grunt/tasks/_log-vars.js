module.exports = function (grunt) {
  grunt.registerTask('_log-vars', 'Logs out user-defined build variables', function() {
    const includes = grunt.config('includes');
    const excludes = grunt.config('excludes');
    const productionExcludes = grunt.config('productionExcludes');

    if (includes && excludes) {
      grunt.fail.fatal('Cannot specify includes and excludes. Please check your config.json configuration.');
    }

    if (includes) {
      const count = includes.length;
      grunt.log.writeln('The following will be included in the build:');
      for (let i = 0; i < count; i++) { grunt.log.writeln('- ' + includes[i]); }
      grunt.log.writeln('');
    }
    if (excludes) {
      const count = excludes.length;
      grunt.log.writeln('The following will be excluded from the build:');
      for (let i = 0; i < count; i++) { grunt.log.writeln('- ' + excludes[i]); }
      grunt.log.writeln('');
    }
    if (productionExcludes) {
      const count = productionExcludes.length;
      grunt.log.writeln('The following will be excluded from the build in production:');
      for (let i = 0; i < count; i++) { grunt.log.writeln('- ' + productionExcludes[i]); }
      grunt.log.writeln('');
    }

    grunt.log.ok(`Using source at '${grunt.config('sourcedir')}'`);
    grunt.log.ok(`Building to '${grunt.config('outputdir')}'`);
    if (grunt.config('theme') !== '**') grunt.log.ok(`Using theme '${grunt.config('theme')}'`);
    if (grunt.config('menu') !== '**') grunt.log.ok(`Using menu ${grunt.config('menu')}'`);
    if (grunt.config('languages') !== '**') grunt.log.ok(`The following languages will be included in the build '${grunt.config('languages')}'`);
  });
};
