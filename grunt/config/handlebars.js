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
                processContent: function(content, filepath) {
                    // grunt.config('helpers').excludedProcess(content, filepath);
                    return content;
                },
                partialRegex: /.*/,
                partialsPathRegex: /\/partials\//
            },
            files: {
                '<%= sourcedir %>templates/templates.js': [
                    '<%= sourcedir %>components/**/*.hbs',
                    '<%= sourcedir %>core/**/*.hbs',
                    '<%= sourcedir %>extensions/**/*.hbs',
                    '<%= sourcedir %>menu/<%= menu %>/**/*.hbs',
                    '<%= sourcedir %>theme/<%= theme %>/**/*.hbs'
                ]
            }
        }
    }
}
