module.exports = function (grunt, options) {
    return {
        dev: {
            options:{
                baseUrl: '<%= sourcedir %>',
                mandatory: [
                    '<%= sourcedir %>core/less/**/*.less'
                ],
                src: [
                    '<%= sourcedir %>menu/<%= menu %>/**/*.less',
                    '<%= sourcedir %>components/**/*.less',
                    '<%= sourcedir %>extensions/**/*.less',
                    '<%= sourcedir %>theme/<%= theme %>/**/*.less'
                ],
                sourcemaps:true,
                compress:false,
                dest: '<%= outputdir %>adapt/css/',
                cssFilename: "adapt.css",
                mapFilename: "adapt.css.map",
                filter: function(filepath) {
                    return grunt.config('helpers').includedFilter(filepath);
                }
            }
        },
        compile: {
            options: {
                baseUrl: '<%= sourcedir %>',
                mandatory: [
                    '<%= sourcedir %>core/less/**/*.less'
                ],
                src: [
                    '<%= sourcedir %>menu/<%= menu %>/**/*.less',
                    '<%= sourcedir %>components/**/*.less',
                    '<%= sourcedir %>extensions/**/*.less',
                    '<%= sourcedir %>theme/<%= theme %>/**/*.less'
                ],
                sourcemaps: false,
                compress:true,
                dest: '<%= outputdir %>adapt/css/',
                cssFilename: "adapt.css",
                mapFilename: "adapt.css.map",
                filter: function(filepath) {
                    return grunt.config('helpers').includedFilter(filepath);
                }
            }
        }
    }
}
