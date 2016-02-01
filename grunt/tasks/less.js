module.exports = function(grunt) {
		var convertSlashes = /\\/g;

      	grunt.registerMultiTask('less', 'Compile LESS files to CSS', function() {
			var less = require('less');
			var _ = require('underscore');
			var path = require("path");
			var done = this.async();
			var options = this.options({});

			var rootPath = path.posix.join(path.posix.resolve(options.baseUrl), "../").replace(convertSlashes, "/");

			var imports = "";

			if (options.mandatory) {
				for (var i = 0, l = options.mandatory.length; i < l; i++) {
					var src = options.mandatory[i];
					grunt.file.expand({}, src).forEach(function(lessPath) {
						console.log(lessPath);
						console.log(rootPath);
						lessPath = path.posix.normalize(lessPath);
						var trimmed = lessPath.substr(rootPath.length);
						imports+= "@import '" + trimmed + "';\n";
					});	
				}
			}

			if (options.src) {
				for (var i = 0, l = options.src.length; i < l; i++) {
					var src = options.src[i];
					grunt.file.expand({filter: options.filter}, src).forEach(function(lessPath) {
						lessPath = path.posix.normalize(lessPath);
						var trimmed = lessPath.substr(rootPath.length);
						imports+= "@import '" + trimmed + "';\n";
					});	
				}
			}

			var sourcemaps;
			if (options.sourcemaps) { 
				sourcemaps = {
					"sourceMap": {
						"sourceMapFileInline": false,
						"outputSourceFiles": true,
						"sourceMapBasepath": "src",
						"sourceMapURL": options.mapFilename,
					} 
				};
			} else {
				var sourceMapPath = path.posix.join(options.dest, options.mapFilename);
				if (grunt.file.exists(sourceMapPath)) grunt.file.delete(sourceMapPath, {force:true});
				if (grunt.file.exists(sourceMapPath+".imports")) grunt.file.delete(sourceMapPath+".imports", {force:true});
			}

			var lessOptions = _.extend({ "compress": options.compress }, sourcemaps);
				
			less.render(imports, lessOptions, complete);

			function complete(error, output) {
				if (error) {
					grunt.fail.fatal(JSON.stringify(error, false, " "));
					return;
				}

				grunt.file.write(path.posix.join(options.dest, options.cssFilename), output.css);
				
				if (output.map) {
					grunt.file.write(path.posix.join(options.dest, options.mapFilename)+".imports", imports);
					grunt.file.write(path.posix.join(options.dest, options.mapFilename), output.map);
				}
				done();
			}
      });
}
