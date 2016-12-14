module.exports = function (grunt, options) {
    return {
        index: {
            files: [
                {
                    expand: true,
                    src: ['<%= sourcedir %>index.html'],
                    dest: '<%= outputdir %>',
                    filter: 'isFile',
                    flatten: true
                }
            ]
        },
        courseAssets: {
            files: [
                {
                    expand: true,
                    src: ['<%=languages%>/**/*', '!**/*.json'],
                    cwd: '<%= sourcedir %>course/',
                    dest: '<%= outputdir %>course/'
                }
            ]
        },
        courseJson: {
            files: [
                {
                    expand: true,
                    src: ['<%=languages%>/*.json'],
                    cwd: '<%= sourcedir %>course/',
                    dest: '<%= outputdir %>course/'
                }
            ]
        },
        coreAssets: {
            files: [
                {
                    expand: true,
                    src: ['<%= sourcedir %>core/assets/**'],
                    dest: '<%= outputdir %>adapt/css/assets/',
                    filter: function(filepath) {
                        return grunt.config('helpers').includedFilter(filepath);
                    },
                    flatten: true
                }
            ]
        },
        componentAssets: {
            files: [
                {
                    expand: true,
                    src: ['<%= sourcedir %>components/**/assets/**'],
                    dest: '<%= outputdir %>assets/',
                    filter: function(filepath) {
                        return grunt.config('helpers').includedFilter(filepath);
                    },
                    flatten: true
                }
            ]
        },
        componentFonts: {
            files: [
                {
                    expand: true,
                    src: ['<%= sourcedir %>components/**/fonts/**'],
                    dest: '<%= outputdir %>adapt/css/fonts/',
                    filter: function(filepath) {
                        return grunt.config('helpers').includedFilter(filepath);
                    },
                    flatten: true
                }
            ]
        },
        extensionAssets: {
            files: [
                {
                    expand: true,
                    src: ['<%= sourcedir %>extensions/**/assets/**'],
                    dest: '<%= outputdir %>assets/',
                    filter: function(filepath) {
                        return grunt.config('helpers').includedFilter(filepath);
                    },
                    flatten: true
                }
            ]
        },
        extensionFonts: {
            files: [
                {
                    expand: true,
                    src: ['<%= sourcedir %>extensions/**/fonts/**'],
                    dest: '<%= outputdir %>adapt/css/fonts/',
                    filter: function(filepath) {
                        return grunt.config('helpers').includedFilter(filepath);
                    },
                    flatten: true
                }
            ]
        },
        menuAssets: {
            files: [
                {
                    expand: true,
                    src: ['<%= sourcedir %>menu/<%= menu %>/assets/**'],
                    dest: '<%= outputdir %>assets/',
                    filter: function(filepath) {
                        return grunt.config('helpers').includedFilter(filepath);
                    },
                    flatten: true
                }
            ]
        },
        coreFonts: {
            files: [
                {
                    expand: true,
                    src: ['<%= sourcedir %>core/fonts/**'],
                    dest: '<%= outputdir %>adapt/css/fonts/',
                    filter: function(filepath) {
                        return grunt.config('helpers').includedFilter(filepath);
                    },
                    flatten: true
                }
            ]
        },
        menuFonts: {
            files: [
                {
                    expand: true,
                    src: ['<%= sourcedir %>menu/<%= menu %>/fonts/**'],
                    dest: '<%= outputdir %>adapt/css/fonts/',
                    filter: function(filepath) {
                        return grunt.config('helpers').includedFilter(filepath);
                    },
                    flatten: true
                }
            ]
        },
        themeAssets: {
            files: [
                {
                    expand: true,
                    src: ['<%= sourcedir %>theme/<%= theme %>/assets/**'],
                    dest: '<%= outputdir %>adapt/css/assets/',
                    filter: function(filepath) {
                        return grunt.config('helpers').includedFilter(filepath);
                    },
                    flatten: true
                }
            ]
        },
        themeFonts: {
            files: [
                {
                    expand: true,
                    src: ['<%= sourcedir %>theme/<%= theme %>/fonts/**'],
                    dest: '<%= outputdir %>adapt/css/fonts/',
                    filter: function(filepath) {
                        return grunt.config('helpers').includedFilter(filepath);
                    },
                    flatten: true
                }
            ]
        },
        main: {
            files: [
                {
                    expand: true,
                    src: ['<%= sourcedir %>core/js/scriptLoader.js'],
                    dest: '<%= outputdir %>adapt/js/',
                    filter: 'isFile',
                    flatten: true
                },
                {
                    expand: true,
                    src: [
                        '<%= sourcedir %>core/js/libraries/*.js'
                    ],
                    dest: '<%= outputdir %>libraries/',
                    filter: 'isFile',
                    flatten: true
                },
                {
                    expand: true,
                    src: ['components/**/libraries/**/*', 'extensions/**/libraries/**/*', 'menu/<%= menu %>/libraries/**/*', 'theme/<%= theme %>/libraries/**/*'],
                    cwd: '<%= sourcedir %>',
                    dest: '<%= outputdir %>/libraries/',
                    filter: function(filepath) {
                        return grunt.config('helpers').includedFilter(filepath);
                    },
                    rename: function(destFolder, srcFileName) {
                        var endOfRequired = srcFileName.indexOf("libraries/") + 9;
                        return destFolder + srcFileName.substr(endOfRequired);
                    }
                },
                {
                    expand: true,
                    src: ['components/**/required/**/*', 'extensions/**/required/**/*', 'menu/<%= menu %>/required/**/*', 'theme/<%= theme %>/required/**/*'],
                    cwd: '<%= sourcedir %>',
                    dest: '<%= outputdir %>',
                    filter: function(filepath) {
                        return grunt.config('helpers').includedFilter(filepath);
                    },
                    rename: function(destFolder, srcFileName) {
                        var endOfRequired = srcFileName.indexOf("required/") + 9;
                        return destFolder + srcFileName.substr(endOfRequired);
                    }
                }
            ]
        }
    }
};
