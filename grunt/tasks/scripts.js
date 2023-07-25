module.exports = function(grunt) {

  const Helpers = require('../helpers')(grunt);
  const buildConfig = Helpers.generateConfigData();

  grunt.registerTask('scripts', 'Run plugin build tasks', function(mode) {

    if (!mode) return;

    const path = require('path');
    const fs = require('fs');
    const options = this.options({});
    const chalk = require('chalk');
    const async = require('async');
    const taskCallback = this.async();

    if (options.plugins) {

      const paths = options.plugins.reduce((paths, src) => {
        paths.push(...grunt.file.expand({
          filter: options.pluginsFilter
        }, src));
        return paths;
      }, []);

      async.each(paths, function(bowerJSONPath, done) {

        if (bowerJSONPath === undefined) return done();
        const bowerJSON = grunt.file.readJSON(bowerJSONPath);

        if (!bowerJSON.scripts) return done();

        const plugindir = path.dirname(bowerJSONPath);
        const script = bowerJSON.scripts[mode];

        if (!script) return done();

        try {
          const buildModule = require(path.join(process.cwd(), plugindir, script));
          buildModule(fs, path, grunt.log.writeln, {
            ...buildConfig,
            ...options,
            plugindir
          }, done);
        } catch (err) {
          grunt.log.writeln(chalk.red(err));
          done();
        }

      }, taskCallback);

    }
  });

};
