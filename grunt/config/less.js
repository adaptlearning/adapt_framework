module.exports = function (grunt, options) {
    return {
        dev: {
            options:{
                baseUrl: '<%= sourcedir %>',
                mandatory: [
                    '<%= sourcedir %>core/less/**/*.less'
                ],
                src: [
                    '<%= sourcedir %>components/**/*.less',
                    '<%= sourcedir %>extensions/**/*.less',
                    '<%= sourcedir %>menu/<%= menu %>/**/*.less',
                    '<%= sourcedir %>theme/<%= theme %>/**/*.less'
                ],
                config: '<%= outputdir %>course/config.<%= jsonext %>',
                sourcemaps:true,
                compress:false,
                dest: '<%= outputdir %>',
                cssFilename: "adapt.css",
                mapFilename: "adapt.css.map",
                filter: function(filepath) {
                    return grunt.config('helpers').includedFilter(filepath);
                },
                replaceUrls: [
                    {
                        "action": "Replace url(../../assets/ with url(assets/",
                        "find": /\.\.\/\.\.\/assets\//,
                        "replaceWith": "assets/"
                    }
                ]
            },
            //newer configuration
            files: {
              '<%= outputdir %>adapt.css': [
                '<%= sourcedir %>/**/*.less'
              ]
            }
        },
        compile: {
            options: {
                baseUrl: '<%= sourcedir %>',
                mandatory: [
                    '<%= sourcedir %>core/less/**/*.less'
                ],
                src: [
                    '<%= sourcedir %>components/**/*.less',
                    '<%= sourcedir %>extensions/**/*.less',
                    '<%= sourcedir %>menu/<%= menu %>/**/*.less',
                    '<%= sourcedir %>theme/<%= theme %>/**/*.less'
                ],
                config: '<%= outputdir %>course/config.<%= jsonext %>',
                sourcemaps: false,
                compress:true,
                dest: '<%= outputdir %>',
                cssFilename: "adapt.css",
                mapFilename: "adapt.css.map",
                filter: function(filepath) {
                    return grunt.config('helpers').includedFilter(filepath);
                },
                replaceUrls: [
                    {
                        "action": "Replace url(../../assets/ with url(assets/",
                        "find": /\.\.\/\.\.\/assets\//,
                        "replaceWith": "assets/"
                    }
                ]
            }
        }
    }
}
