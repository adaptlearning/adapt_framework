module.exports = function(grunt) {
    grunt.registerTask('setoutput', function(outputConfig) {
        grunt.config('outputConfig', outputConfig);
    });
};
