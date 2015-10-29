module.exports = function(grunt) {
    var Helpers = require('../helpers')(grunt);

    grunt.loadNpmTasks('adapt-grunt-tracking-ids');

    grunt.registerTask('tracking-insert', 'Adds any missing tracking IDs (starting at the highest existing ID)', function() {
        if(Helpers.isPluginInstalled('adapt-contrib-spoor')) grunt.task.run(['adapt_insert_tracking_ids']);
    });
}
