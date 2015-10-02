module.exports = function(grunt) {
    grunt.registerTask('_log-vars', 'Logs out user-defined build variables', function() {
        grunt.log.ok('Using source at "' + grunt.config.get('sourcedir') + '"');
        grunt.log.ok('Building to "' + grunt.config.get('outputdir') + '"');
        if (grunt.config.get('theme') !== '**') grunt.log.ok('Using theme "' + grunt.config.get('theme') + '"');
        if (grunt.config.get('menu') !== '**') grunt.log.ok('Using menu "' + grunt.config.get('menu') + '"');
    });
}
