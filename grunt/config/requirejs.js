module.exports = function (grunt, options) {
    return {
        dev: {
            options: {
                name: 'core/js/app',
                baseUrl: '<%= sourcedir %>',
                mainConfigFile: './config.js',
                out: '<%= outputdir %>adapt/js/adapt.min.js',
                generateSourceMaps: true,
                preserveLicenseComments:false,
                optimize: 'none',
                fileExclusionRegExp: /adapt-contrib-media/
            }
        },
        compile: {
            options: {
                name: 'core/js/app',
                baseUrl: '<%= sourcedir %>',
                mainConfigFile: './config.js',
                out: '<%= outputdir %>adapt/js/adapt.min.js',
                optimize: 'uglify2',
                fileExclusionRegExp: '<%= helpers.excludedRegExp %>'
            }
        }
    }
}
