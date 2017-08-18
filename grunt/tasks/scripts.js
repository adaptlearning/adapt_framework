module.exports = function(grunt) {

    grunt.registerTask('scripts', 'Run plugin build tasks', function(mode) {

        if (!mode) return;

        var path = require("path");
        var fs = require("fs");
        var options = this.options({});

        if (options.plugins) {

            for (var i = 0, l = options.plugins.length; i < l; i++) {
                var src = options.plugins[i];
                grunt.file.expand({ filter: options.pluginsFilter }, src).forEach(function(bowerJSONPath) {

                    if (bowerJSONPath === undefined) return;
                    var bowerJSON = grunt.file.readJSON(bowerJSONPath);

                    if (!bowerJSON.scripts) return;

                    var plugindir = path.dirname(bowerJSONPath)
                    var script = bowerJSON.scripts[mode];
                    var buildModule = require(path.join(plugindir, script));
                    buildModule(fs, path, grunt.log.writeLn, {
                       sourcedir: options.sourcedir,
                       outputdir: options.outputdir,
                       plugindir: plugindir
                    });

                });
            }
        }
    });

};