module.exports = function (grunt) {
    // Inserts a unique 'trackingID' attribute on each block element
    grunt.registerTask('insert-tracking-data', 'Inserting SCORM tracking data', function() {
        function setTrackingID(block) {
            if (block !== undefined) {
                if(block.trackingID === undefined) {
                    block.trackingID = ++options.latestTrackingID;
                    grunt.log.writeln("Adding tracking ID: " + block.trackingID + " to " + block.id);
                } else {
                    if(options.usedTrackingIDs.indexOf(block.trackingID) > -1) {
                        grunt.log.writeln("Warning: " + block.id + " has the tracking ID " + block.trackingID + ", but this is already in use. Changing to " + (options.latestTrackingID + 1) + ".");
                        block.trackingID = ++options.latestTrackingID;
                    }
                    if(options.latestTrackingID < block.trackingID) options.latestTrackingID = block.trackingID;
                }
                options.usedTrackingIDs.push(block.trackingID);
            } 
        }

        var options = {latestTrackingID: -1, usedTrackingIDs: []};
        var configJson = grunt.file.readJSON('src/course/config.json');
        var lang = configJson._defaultLanguage;
        var courseJson = grunt.file.readJSON('src/course/' + lang + '/course.json');
        var blocksJson = grunt.file.readJSON('src/course/' + lang + '/blocks.json');
        var latestTrackingID = courseJson.latestTrackingID || - 1;
        
        grunt.log.writeln('latest = ' + latestTrackingID);

        for (var i in blocksJson) {
            setTrackingID(blocksJson[i]);
        }

        courseJson.latestTrackingID = options.latestTrackingID;

        grunt.log.writeln("The latest tracking ID is " + courseJson.latestTrackingID);

        grunt.file.write('src/course/' + lang + '/course.json', JSON.stringify(courseJson));
        grunt.file.write('src/course/' + lang + '/blocks.json', JSON.stringify(blocksJson));
    });
}   