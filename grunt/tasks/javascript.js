module.exports = function(grunt) {

	var convertSlashes = /\\/g;

	grunt.registerMultiTask('javascript', 'Compile JavaScript files', function() {

		var requirejs = require('requirejs');
		var _ = require('underscore');
		var path = require("path");
		var fs = require("fs");
		var done = this.async();
		var options = this.options({});

		if (options.plugins) {
			var pluginsClientSidePatch = '';

			var doesPluginPathExists = true;
			try {
				fs.statSync(options.pluginsPath);
			} catch(e) {
				doesPluginPathExists = false;
			}

			if (!doesPluginPathExists) {
				//make endpoint for plugin attachment
				//apply client side patch
				fs.writeFileSync(options.pluginsPath, pluginsClientSidePatch);
			}

			options.shim = options.shim || {};
			options.shim[options.pluginsModule] = {deps:[]};

			for (var i = 0, l = options.plugins.length; i < l; i++) {
				var src = options.plugins[i];
				grunt.file.expand({ filter: options.pluginsFilter }, src).forEach(function(bowerJSONPath) {

					if (bowerJSONPath === undefined) return;

					var pluginPath = path.dirname(bowerJSONPath);

					var bowerJSON = grunt.file.readJSON(bowerJSONPath);

					var requireJSRootPath = pluginPath.substr(options.baseUrl.length);

					var requireJSMainPath = path.join(requireJSRootPath, bowerJSON.main);

					var ext = path.extname(requireJSMainPath);

					var requireJSMainPathNoExt = requireJSMainPath.slice(0, -ext.length).replace(convertSlashes, "/");

					options.shim[options.pluginsModule].deps.push(requireJSMainPathNoExt);

				});
			}
		}

		requirejs.optimize(options, function() {
			done();
		}, function(error) {
			grunt.fail.fatal(error);
		});
	});
};
