module.exports = function (grunt, options) {
    return {
        dev: {
            options: {
                name: 'core/js/app',
                baseUrl: '<%= sourcedir %>',
                mainConfigFile: './config.js',
                out: '<%= outputdir %>adapt/js/adapt.min.js',
                //fetch these bower plugins an add them as dependencies to the app.js
                plugins: [
                    '<%= sourcedir %>components/*/bower.json',
                    '<%= sourcedir %>extensions/*/bower.json',
                    '<%= sourcedir %>menu/<%= menu %>/bower.json',
                    '<%= sourcedir %>theme/<%= theme %>/bower.json'
                ],
                pluginsPath: '<%= sourcedir %>plugins.js',
                pluginsModule: 'plugins',
                pluginsFilter: function(filepath) {
                    return grunt.config('helpers').includedFilter(filepath);
                },
                generateSourceMaps: true,
                preserveLicenseComments:false,
                optimize: 'none'
            }
        },
        compile: {
            options: {
                name: 'core/js/app',
                baseUrl: '<%= sourcedir %>',
                mainConfigFile: './config.js',
                out: '<%= outputdir %>adapt/js/adapt.min.js',
                //fetch these bower plugins an add them as dependencies to the app.js
                plugins: [
                    '<%= sourcedir %>components/*/bower.json',
                    '<%= sourcedir %>extensions/*/bower.json',
                    '<%= sourcedir %>menu/<%= menu %>/bower.json',
                    '<%= sourcedir %>theme/<%= theme %>/bower.json'
                ],
                pluginsPath: '<%= sourcedir %>/plugins.js',
                pluginsModule: 'plugins',
                pluginsFilter: function(filepath) {
                    return grunt.config('helpers').includedFilter(filepath);
                },
                preserveLicenseComments:false,
                optimize: 'uglify2',
                uglify2: {
                    compress: false
                }
            }
        }
    }
}
