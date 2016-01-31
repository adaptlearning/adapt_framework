module.exports = function(grunt) {
    var Helpers = require('../helpers')(grunt);

    grunt.registerTask('tracking-remove', 'Removes all tracking IDs', function() {
        if(!Helpers.isPluginInstalled('adapt-contrib-spoor')) return;

        var options = this.options();
        function removeTrackingIds(blocks, course){
            
            for(var i = 0; i < blocks.length; i++) {
                delete blocks[i]._trackingId;
            }
            delete course._latestTrackingId;
            grunt.log.writeln("Tracking IDs removed.");
            grunt.file.write(options.courseFile, JSON.stringify(course, null, "    "));
            grunt.file.write(options.blocksFile, JSON.stringify(blocks, null, "    "));
        }
        
        removeTrackingIds(grunt.file.readJSON(options.blocksFile), grunt.file.readJSON(options.courseFile));
    });
}
