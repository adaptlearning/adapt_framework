module.exports = function(grunt) {
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        copy: {
            main: {
                files: [
                    {
                        expand: true, 
                        src: ['src/index.html'], 
                        dest: 'build/', 
                        filter: 'isFile', 
                        flatten: true
                    },
                    {
                        expand: true, 
                        src: ['**/*'], 
                        dest: 'build/course/', 
                        cwd: 'src/course/'
                    },
                    {
                        expand: true, 
                        src: ['src/core/js/scriptLoader.js'], 
                        dest: 'build/adapt/js/', 
                        filter: 'isFile', 
                        flatten: true
                    },
                    {
                        expand: true, 
                        src: ['src/core/js/libraries/require.js', 'src/core/js/libraries/modernizr.js'], 
                        dest: 'build/libraries/', 
                        filter: 'isFile', 
                        flatten: true
                    },
                    {
                        expand: true,
                        flatten: true,
                        src: ['src/theme/**/fonts/**'],
                        dest: 'build/adapt/css/fonts/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        flatten: true,
                        src: ['src/theme/**/assets/**'],
                        dest: 'build/adapt/css/assets/',
                        filter: 'isFile'
                    }
                ]
            }
        },
        concat: {
            less: {
                src: [
                    'src/core/less/*.less', 
                    'src/theme/**/*.less', 
                    'src/menu/**/*.less', 
                    'src/components/**/*.less', 
                    'src/extensions/**/*.less'
                ],
                dest: 'src/less/adapt.less'
            }
        },
        less: {
            options:{
                compress:true
            },
            dist: {
                files: {
                    'build/adapt/css/adapt.css' : 'src/less/adapt.less'
                }
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
                    "src/templates/templates.js": "src/**/*.hbs"
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
                src: 'src/components',
                dest: 'src/components/components.js',
                options: {
                    baseUrl: "src",
                    moduleName: 'components/components'
                }
            },
            extensions: {
                src: 'src/extensions/',
                dest: 'src/extensions/extensions.js',
                options: {
                    baseUrl: "src",
                    moduleName: 'extensions/extensions'
                }
            },
            menu: {
                src: 'src/menu/',
                dest: 'src/menu/menu.js',
                options: {
                    baseUrl: "src",
                    moduleName: 'menu/menu'
                }
            },
            theme: {
                src: 'src/theme/',
                dest: 'src/theme/theme.js',
                options: {
                    baseUrl: "src",
                    moduleName: 'themes/themes'
                }
            }
        },
        requirejs: {
            dev: {
                options: {
                    name: "core/js/app",
                    baseUrl: "src",
                    mainConfigFile: "./config.js",
                    out: "./build/adapt/js/adapt.min.js",
                    generateSourceMaps: true,
                    preserveLicenseComments:false,
                    optimize: "none"
                }
            },
            compile: {
                options: {
                    name: "core/js/app",
                    baseUrl: "src",
                    mainConfigFile: "./config.js",
                    out: "./build/adapt/js/adapt.min.js",
                    optimize:"uglify2"
                }
            }
        },
        watch: {
            files: ['src/**/*.less', 'src/**/*.handlebars'],
            tasks: ['concat', 'less', 'handlebars']
        }
    });
    
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.registerTask('default',['less', 'handlebars', 'watch']);
    grunt.registerTask('build',['copy', 'concat', 'less', 'handlebars', 'bower', 'requirejs-bundle', 'requirejs:compile']);
    grunt.registerTask('dev',['copy', 'concat', 'less', 'handlebars', 'bower', 'requirejs-bundle', 'requirejs:dev']);
};