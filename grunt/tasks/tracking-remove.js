module.exports = function(grunt) {
    var Helpers = require('../helpers')(grunt);
    grunt.loadNpmTasks('adapt-grunt-tracking-ids');

    grunt.registerTask('tracking-remove', 'Removes all tracking IDs', function() {
        if(Helpers.isPluginInstalled('adapt-contrib-spoor')) grunt.task.run(['adapt_remove_tracking_ids']);
    });
}
