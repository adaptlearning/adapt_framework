module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		less: {
			dist: {
				files: {
					'build/adapt/css/adapt.css' : 'src/**/*.less'
				}
			},
            options:{ 
                compress:true
            }
		},
        handlebars: {
            compile: {
                options: {
                    namespace:"Handlebars.templates",
                    processName: function(filePath) {
                        var newFilePath = filePath.split("/");
                        newFilePath = newFilePath[newFilePath.length - 1].replace(/\.[^/.]+$/, "");
                        return  newFilePath// output: _header.hbs
                    },
                    partialRegex: /^part_/,
                    partialsPathRegex: /\/partials\//
                },
                files: {
                    "build/templates/templates.js": "src/**/*.handlebars"
                }
            }
        },
        requirejs: {
            compile: {
                options: {
                    name: "core/js/app",
                    baseUrl: "src",
                    mainConfigFile: "./config.js",
                    out: "./build/adapt/js/adapt.min.js"
                }
            }
        },
		watch: {
            files: ['src/**/*.less', 'src/**/*.handlebars'],
            tasks: ['less', 'handlebars']
		}
	});
	grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-handlebars');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.registerTask('default',['less', 'handlebars', 'watch']);
	grunt.registerTask('build',['less', 'handlebars', 'requirejs']);
}

/*
"build/templates/partials.js": "src/**//*.handlebars"*/