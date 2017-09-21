module.exports = function (grunt, options) {
    return {
        dev: {
            options:{
                baseUrl: '<%= sourcedir %>',
                mandatory: [
                    '<%= sourcedir %>core/less/*.less',
                    '<%= sourcedir %>core/less/browser/*.less',
                    '<%= sourcedir %>core/less/variables/*.less',
                    '<%= sourcedir %>core/less/common/*.less',
                    '<%= sourcedir %>core/less/modules/*.less',
                    '<%= sourcedir %>core/less/structure/*.less'
                ],
                src: [
                    '<%= sourcedir %>components/**/*.less',
                    '<%= sourcedir %>extensions/**/*.less',
                    '<%= sourcedir %>menu/<%= menu %>/**/*.less',
                    '<%= sourcedir %>theme/<%= theme %>/**/*.less'
                ],
                config: '<%= outputdir %>course/config.json',
                sourcemaps:true,
                compress:false,
                dest: '<%= outputdir %>adapt/css/',
                cssFilename: "adapt.css",
                mapFilename: "adapt.css.map",
                filter: function(filepath) {
                    return grunt.config('helpers').includedFilter(filepath);
                }
            },
            //newer configuration
            files: {
              '<%= outputdir %>adapt/css/adapt.css': [
                '<%= sourcedir %>/**/*.less'
              ]
            }
        },
        compile: {
            options: {
                baseUrl: '<%= sourcedir %>',
                mandatory: [
                    '<%= sourcedir %>core/less/*.less',
                    '<%= sourcedir %>core/less/browser/*.less',
                    '<%= sourcedir %>core/less/variables/*.less',
                    '<%= sourcedir %>core/less/common/*.less',
                    '<%= sourcedir %>core/less/modules/*.less',
                    '<%= sourcedir %>core/less/structure/*.less'
                ],
                src: [
                    '<%= sourcedir %>components/**/*.less',
                    '<%= sourcedir %>extensions/**/*.less',
                    '<%= sourcedir %>menu/<%= menu %>/**/*.less',
                    '<%= sourcedir %>theme/<%= theme %>/**/*.less'
                ],
                config: '<%= outputdir %>course/config.json',
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
