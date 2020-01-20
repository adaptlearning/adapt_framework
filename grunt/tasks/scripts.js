module.exports = function(grunt) {

  grunt.registerTask('scripts', 'Run plugin build tasks', function(mode) {

    if (!mode) return;

    var path = require('path');
    var fs = require('fs');
    var options = this.options({});
    var chalk = require('chalk');
    var async = require('async');
    var taskCallback = this.async();

    if (options.plugins) {

      var paths = [];
      for (var i = 0, l = options.plugins.length; i < l; i++) {
        var src = options.plugins[i];
        paths = paths.concat(grunt.file.expand({
          filter: options.pluginsFilter
        }, src));
      }

      async.each(paths, function(bowerJSONPath, done) {

        if (bowerJSONPath === undefined) return done();
        var bowerJSON = grunt.file.readJSON(bowerJSONPath);

        if (!bowerJSON.scripts) return done();

        var plugindir = path.dirname(bowerJSONPath);
        var script = bowerJSON.scripts[mode];

        if (!script) return done();

        try {
          var buildModule = require(path.join(process.cwd(), plugindir, script));
          buildModule(fs, path, grunt.log.writeln, {
            sourcedir: options.sourcedir,
            outputdir: options.outputdir,
            plugindir: plugindir
          }, done);
        } catch (err) {
          grunt.log.writeln(chalk.red(err));
          done();
        }

      }, taskCallback);

    }
  });

};
