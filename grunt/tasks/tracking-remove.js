module.exports = function(grunt) {
  var Helpers = require('../helpers')(grunt);
  var path = require('path');

  grunt.registerTask('tracking-remove', 'Removes all tracking IDs', function() {
    if (!Helpers.isPluginInstalled('adapt-contrib-spoor')) return;

    var options = this.options();

    function removeTrackingIds(blocksPath, coursePath) {
      var blocks = grunt.file.readJSON(blocksPath);
      var course = grunt.file.readJSON(coursePath);

      for (var i = 0; i < blocks.length; i++) {
        delete blocks[i]._trackingId;
      }
      delete course._latestTrackingId;
      grunt.log.writeln("Tracking IDs removed.");
      grunt.file.write(coursePath, JSON.stringify(course, null, 4));
      grunt.file.write(blocksPath, JSON.stringify(blocks, null, 4));
    }

    var isOutputDir = (grunt.option('outputdir') && grunt.option('outputdir').slice(-5) !== "build");
    var sourcedir = isOutputDir ? grunt.option('outputdir') : grunt.config('sourcedir');

    var blocksFiles = grunt.file.expand(path.join(sourcedir, options.blocksFile));
    var courseFiles = grunt.file.expand(path.join(sourcedir, options.courseFile));

    for (var i = 0; i < blocksFiles.length; i++) {
      removeTrackingIds(blocksFiles[i], courseFiles[i]);
    }

  });
};
