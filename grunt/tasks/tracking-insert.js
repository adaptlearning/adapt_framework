module.exports = function(grunt) {
    var Helpers = require('../helpers')(grunt);

    grunt.registerTask('tracking-insert', 'Adds any missing tracking IDs (starting at the highest existing ID)', function() {
        if(!Helpers.isPluginInstalled('adapt-contrib-spoor')) return;
        
        var options = this.options({
            _latestTrackingId: -1,
            _trackingIdsSeen: []
        });
        
        function insertTrackingIds(blocks, course){
            options._latestTrackingId = course._latestTrackingId || -1;
            
            for(var i = 0; i < blocks.length; i++) {
                var block = blocks[i];
                grunt.log.writeln("block: " + block._id + ": " + (block._trackingId !== undefined ? block._trackingId : "not set"));
                if(block._trackingId === undefined) {
                    block._trackingId = ++options._latestTrackingId;
                    grunt.log.writeln("Adding tracking ID: " + block._trackingId + " to block " + block._id);
                } else {
                    if(options._trackingIdsSeen.indexOf(block._trackingId) > -1) {
                        grunt.log.writeln("Warning: " + block._id + " has the tracking ID " + block._trackingId + ", but this is already in use. Changing to " + (options._latestTrackingId + 1) + ".");
                        block._trackingId = ++options._latestTrackingId;
                    } else {
                        options._trackingIdsSeen.push(block._trackingId);
                    }
                }
                if(options._latestTrackingId < block._trackingId) {
                    options._latestTrackingId = block._trackingId;
                }
                    
            }
            course._latestTrackingId = options._latestTrackingId;
            grunt.log.writeln("Task complete. The latest tracking ID is " + course._latestTrackingId);
            grunt.file.write(options.courseFile, JSON.stringify(course, null, "    "));
            grunt.file.write(options.blocksFile, JSON.stringify(blocks, null, "    "));
        }
        
        insertTrackingIds(grunt.file.readJSON(options.blocksFile), grunt.file.readJSON(options.courseFile));
    });
}
