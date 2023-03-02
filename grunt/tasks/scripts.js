module.exports = function(grunt) {

  grunt.registerTask('scripts', 'Run plugin build tasks', function(mode) {

    if (!mode) return;

    const path = require('path');
    const fs = require('fs');
    const options = this.options({});
    const chalk = require('chalk');
    const async = require('async');
    const taskCallback = this.async();

    if (options.plugins) {

      let paths = [];
      for (let i = 0, l = options.plugins.length; i < l; i++) {
        const src = options.plugins[i];
        paths = paths.concat(grunt.file.expand({
          filter: options.pluginsFilter,
          order: options.pluginsOrder
        }, src));
      }

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
            sourcedir: options.sourcedir,
            outputdir: options.outputdir,
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
