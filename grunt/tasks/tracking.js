/**
* Tasks related to SCORM tracking setup
*/
module.exports = function(grunt) {
    grunt.loadNpmTasks('adapt-grunt-tracking-ids');

    grunt.registerTask('tracking-insert', 'Adds any missing tracking IDs (starting at the highest existing ID)', function() {
        if(Helpers.isPluginInstalled('adapt-contrib-spoor')) grunt.task.run(['adapt_insert_tracking_ids']);
    });

    grunt.registerTask('tracking-remove', 'Removes all tracking IDs', function() {
        if(Helpers.isPluginInstalled('adapt-contrib-spoor')) grunt.task.run(['adapt_remove_tracking_ids']);
    });

    grunt.registerTask('tracking-reset', 'Resets and re-inserts all tracking IDs, starting with 0', function() {
        if(Helpers.isPluginInstalled('adapt-contrib-spoor')) grunt.task.run(['adapt_reset_tracking_ids']);
    });
}
