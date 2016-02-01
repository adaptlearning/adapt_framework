module.exports = function(grunt) {

	var convertSlashes = /\\/g;
	var pluginsClientSidePatch = 'requirejs.config({map: { "*": { "extensions/extensions":"plugins","menu/menu":"plugins","theme/theme":"plugins","components/components":"plugins" } } });';

    grunt.registerMultiTask('javascript', 'Compile JavaScript files', function() {

  		var requirejs = require('requirejs');
		var _ = require('underscore');
		var path = require("path");
		var fs = require("fs");
		var done = this.async();
		var options = this.options({});

		if (options.plugins) {

			if (!fs.existsSync(options.pluginsPath)) {
				//make endpoint for plugin attachment
				//apply client side patch
				fs.writeFileSync(options.pluginsPath, pluginsClientSidePatch);
			}

			options.shim = options.shim || {};
			options.shim["plugins"] = {deps:[]};

			for (var i = 0, l = options.plugins.length; i < l; i++) {
				var src = options.plugins[i];
				grunt.file.expand({}, src).forEach(function(bowerJSONPath) {

					if (bowerJSONPath === undefined) return;

					var pluginPath = path.dirname(bowerJSONPath);

					var bowerJSON = grunt.file.readJSON(bowerJSONPath);

					var requireJSRootPath = pluginPath.substr(options.baseUrl.length);

					var requireJSMainPath = path.join(requireJSRootPath, bowerJSON.main);

					var ext = path.extname(requireJSMainPath);

					var requireJSMainPathNoExt = requireJSMainPath.slice(0, -ext.length).replace(convertSlashes, "/");

					options.shim["plugins"].deps.push(requireJSMainPathNoExt);

				});	
			}

		}

		requirejs.optimize(options, function() {
			console.log("done");
			done();
		});

  	});
};
