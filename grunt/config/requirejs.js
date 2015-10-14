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
                onBuildRead: function(moduleName, path, contents) {
                    return grunt.config('helpers').includedProcess(contents, path);
                }
            }
        },
        compile: {
            options: {
                name: 'core/js/app',
                baseUrl: '<%= sourcedir %>',
                mainConfigFile: './config.js',
                out: '<%= outputdir %>adapt/js/adapt.min.js',
                optimize: 'uglify2',
                onBuildRead: function(moduleName, path, contents) {
                    return grunt.config('helpers').includedProcess(contents, path);
                }
            }
        }
    }
}
