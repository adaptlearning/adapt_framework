module.exports = function(grunt) {
    var Helpers = require('../helpers')(grunt);
    grunt.loadNpmTasks('adapt-grunt-tracking-ids');

    grunt.registerTask('tracking-reset', 'Resets and re-inserts all tracking IDs, starting with 0', function() {
        if(Helpers.isPluginInstalled('adapt-contrib-spoor')) grunt.task.run(['adapt_reset_tracking_ids']);
    });
}
