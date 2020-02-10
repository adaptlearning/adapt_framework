module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-json-minify');
  grunt.registerMultiTask('json-prettify', 'Prettify the JSON in course output', function() {
    grunt.config.merge({
      'json-minify': {
        inverse: this.data
      }
    });
    grunt.task.run("json-minify:inverse");
  });
}