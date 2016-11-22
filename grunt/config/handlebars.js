module.exports = function(grunt) {
    return {
        compile: {
            options: {
                amd: 'handlebars',
                namespace:'Handlebars.templates',
                processName: function(filePath) {
                    var newFilePath = filePath.split('/');
                    newFilePath = newFilePath[newFilePath.length - 1].replace(/\.[^/.]+$/, '');
                    return  newFilePath;
                },
                partialRegex: /.*/,
                partialsPathRegex: /\/partials\//
            },
            files: [
                {
                    src: [
                        '<%= sourcedir %>core/**/*.hbs',
                        '<%= sourcedir %>components/**/*.hbs',
                        '<%= sourcedir %>extensions/**/*.hbs',
                        '<%= sourcedir %>menu/<%= menu %>/**/*.hbs',
                        '<%= sourcedir %>theme/<%= theme %>/**/*.hbs'
                    ],
                    dest: '<%= outputdir %>templates.js',
                    filter: function(filepath) {
                        return grunt.config('helpers').includedFilter(filepath);
                    }
                }
            ]
        }
    }
}
