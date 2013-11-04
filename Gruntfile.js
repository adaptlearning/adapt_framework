module.exports = function(grunt) {
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

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
                        return  newFilePath;
                    },
                    partialRegex: /^part_/,
                    partialsPathRegex: /\/partials\//
                },
                files: {
                    "build/templates/templates.js": "src/**/*.handlebars"
                }
            }
        },
        bower: {
            target: {
                rjsConfig: './config.js',
                options: {
                    baseUrl: 'src'
                }
            }
        },
        'requirejs-bundle': {
            components: {
                src: 'src/components/',
                dest: 'src/components.js'
            },
            extensions: {
                src: 'src/extensions/',
                dest: 'src/extensions.js'
            },
            menu: {
                src: 'src/menu/',
                dest: 'src/menu.js'
            },
            theme: {
                src: 'src/theme/',
                dest: 'src/theme.js'
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
        
    grunt.registerTask('default',['less', 'handlebars', 'watch']);
    grunt.registerTask('build',['less', 'handlebars', 'bower', 'requirejs-bundle', 'requirejs']);
};