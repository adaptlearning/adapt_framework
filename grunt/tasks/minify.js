module.exports = function(grunt, options) {
  grunt.registerTask('minify', 'Minifies JSON and JS files in course output', ['json-minify', 'uglify']);
};
