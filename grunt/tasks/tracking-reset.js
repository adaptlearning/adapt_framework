module.exports = function(grunt) {
  var Helpers = require('../helpers')(grunt);
  var path = require('path');

  grunt.registerTask('tracking-reset', 'Resets and re-inserts all tracking IDs, starting with 0', function() {
    if (!Helpers.isPluginInstalled('adapt-contrib-spoor')) return;

    var options = this.options({
      _latestTrackingId: -1,
    });

    var isOutputDir = (grunt.option('outputdir') && grunt.option('outputdir').slice(-5) !== "build");
    var sourcedir = isOutputDir ? grunt.option('outputdir') : grunt.config('sourcedir');

    var blocksFiles = grunt.file.expand(path.join(sourcedir, options.blocksFile));
    var courseFiles = grunt.file.expand(path.join(sourcedir, options.courseFile));

    for (var i = 0; i < blocksFiles.length; i++) {
      resetTrackingIds(blocksFiles[i], courseFiles[i]);
      options._latestTrackingId = -1;
    }

    function resetTrackingIds(blocksPath, coursePath) {
      var blocks = grunt.file.readJSON(blocksPath);
      var course = grunt.file.readJSON(coursePath);

      for (var i = 0; i < blocks.length; i++) {
        var block = blocks[i];
        block._trackingId = ++options._latestTrackingId;
        grunt.log.writeln("Adding tracking ID: " + block._trackingId + " to block " + block._id);
        options._latestTrackingId = block._trackingId;
      }
      course._latestTrackingId = options._latestTrackingId;
      grunt.log.writeln("The latest tracking ID is " + course._latestTrackingId);
      grunt.file.write(coursePath, JSON.stringify(course, null, 4));
      grunt.file.write(blocksPath, JSON.stringify(blocks, null, 4));
    }

  });
};
