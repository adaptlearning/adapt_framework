module.exports = function (grunt, options) {
    grunt.registerTask('minify', 'Minifies JSON content and library JS files in course output', ['json-minify', 'uglify:libraries']);
}