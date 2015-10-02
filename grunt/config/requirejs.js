module.exports = {
    dev: {
        options: {
            name: 'core/js/app',
            baseUrl: '<%= sourcedir %>',
            mainConfigFile: './config.js',
            out: '<%= outputdir %>adapt/js/adapt.min.js',
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
            optimize: 'uglify2'
        }
    }
}
