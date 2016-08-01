module.exports = function(grunt) {
    var Helpers = require('../helpers')(grunt);

    grunt.registerTask('tracking-remove', 'Removes all tracking IDs', function() {
        if(!Helpers.isPluginInstalled('adapt-contrib-spoor')) return;

        var options = this.options();
        function removeTrackingIds(blocksPath, coursePath){
            var blocks = grunt.file.readJSON(blocksPath);
            var course = grunt.file.readJSON(coursePath);
            
            for(var i = 0; i < blocks.length; i++) {
                delete blocks[i]._trackingId;
            }
            delete course._latestTrackingId;
            grunt.log.writeln("Tracking IDs removed.");
            grunt.file.write(coursePath, JSON.stringify(course, null, "    "));
            grunt.file.write(blocksPath, JSON.stringify(blocks, null, "    "));
        }
        
        var blocksFiles = grunt.file.expand(options.blocksFile);
        var courseFiles = grunt.file.expand(options.courseFile);
        
        for (var i = 0; i < blocksFiles.length; i++) {
            removeTrackingIds(blocksFiles[i], courseFiles[i]);
        }
        
    });
};
