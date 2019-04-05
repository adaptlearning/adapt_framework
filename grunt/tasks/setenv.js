module.exports = function(grunt) {
    grunt.registerTask('setenv', function(env) {
        grunt.config('env', env);
    });
};
