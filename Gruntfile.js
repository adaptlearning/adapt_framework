module.exports = function(grunt) {
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        copy: {
            index: {
                files: [
                    {
                        expand: true, 
                        src: ['src/index.html'], 
                        dest: 'build/', 
                        filter: 'isFile', 
                        flatten: true
                    },
                ]
            },
            main: {
                files: [
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
                    },
                    {
                        expand: true,
                        flatten: true,
                        src: ['src/components/**/assets/**'],
                        dest: 'build/assets/',
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
                    'src/templates/templates.js': 'src/**/*.hbs'
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
            less: {
                files: ['src/**/*.less'],
                tasks: ['concat', 'less']
            },
            handlebars: {
                files: ['src/**/*.hbs'],
                tasks: ['handlebars', 'compile']
            },
            js: {
                files: [
                    'src/**/*.js', 
                    '!src/components/components.js',
                    '!src/extensions/extensions.js',
                    '!src/menu/menu.js',
                    '!src/themes/theme.js',
                    '!src/templates/templates.js',
                ],
                tasks: ['compile']
            },
            index: {
                files: ['src/index.html'],
                tasks: ['copy:index']
            },
            assets: {
                files: [
                    'src/theme/**/fonts/**',
                    'src/theme/**/assets/**',
                    'src/components/**/assets/**'
                ],
                tasks: ['copy:main']
            }
        },
        connect: {
            server: {
              options: {
                port: 9001,
                base: 'build',
                keepalive:true
              }
            }
        }
    });
    
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.registerTask('add-xml-manifest', 'Add XML manifest', function() {
        var courseJson = grunt.file.readJSON('src/course/en/course.json');
        
        if (courseJson) {
            grunt.log.writeln('Generating XML manifest');

            // As the XML file is unlikely to change much at this point, a concatenated string is used
            // We could possibly read this in from a template XML asset in the future
            var manifestXml = '<?xml version="1.0" encoding="UTF-8"?>\n';
            manifestXml += '<manifest identifier="adapt_manifest" version="1" xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2" xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd http://www.imsglobal.org/xsd/imsmd_rootv1p2p1 imsmd_rootv1p2p1.xsd http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">\n';
            manifestXml += '    <metadata>\n';
            manifestXml += '        <schema>ADL SCORM</schema>\n';
            manifestXml += '        <schemaversion>1.2</schemaversion>\n';
            manifestXml += '        <lom xmlns="http://www.imsglobal.org/xsd/imsmd_rootv1p2p1" xsi:schemaLocation="http://www.imsglobal.org/xsd/imsmd_rootv1p2p1 imsmd_rootv1p2p1.xsd">\n';
            manifestXml += '            <general>\n';
            manifestXml += '                <title>\n';
            manifestXml += '                    <langstring xml:lang="x-none">' + courseJson.title + '</langstring>\n';
            manifestXml += '                </title>\n';
            manifestXml += '                <description>\n';
            manifestXml += '                    <langstring xml:lang="x-none">' + courseJson.body + '</langstring>\n';
            manifestXml += '                </description>\n';
            manifestXml += '            </general>\n';
            manifestXml += '        </lom>\n';
            manifestXml += '    </metadata>\n';
            manifestXml += '<organizations default="adapt_scorm">\n';
            manifestXml += '    <organization identifier="adapt_scorm">\n';
            manifestXml += '        <title>Adapt SCORM Test</title>\n';
            manifestXml += '        <item identifier="item_1" isvisible="true" identifierref="res1">\n';
            manifestXml += '            <title>Adapt SCORM Test</title>\n';
            manifestXml += '            <adlcp:masteryscore>70</adlcp:masteryscore>\n';
            manifestXml += '        </item>\n';
            manifestXml += '    </organization>\n';
            manifestXml += '</organizations>\n';
            manifestXml += '<resources>\n';
            manifestXml += '    <resource identifier="res1" type="webcontent" href="index.html" adlcp:scormtype="sco">\n';
            manifestXml += '        <file href="index.html"/>\n';
            manifestXml += '    </resource>\n';
            manifestXml += '</resources>\n';
            manifestXml += '</manifest>';

            grunt.file.write('build/imsmanifest.xml', manifestXml);

        } else {
            grunt.log.error('course.json not found!');
        }


    });

    grunt.registerTask('default',['less', 'handlebars', 'watch']);
    grunt.registerTask('compile',['bower', 'requirejs-bundle', 'requirejs:dev']);
    grunt.registerTask('build',['copy', 'concat', 'less', 'handlebars', 'bower', 'requirejs-bundle', 'requirejs:compile', 'add-xml-manifest']);
    grunt.registerTask('dev',['copy', 'concat', 'less', 'handlebars', 'bower', 'requirejs-bundle', 'requirejs:dev', 'add-xml-manifest']);
};