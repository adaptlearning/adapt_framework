/**
* This is a simple function to take the course's config.json
* and append the theme and menu .json
*/
module.exports = function(grunt) {
    grunt.registerTask('create-json-config', 'Creating config.json', function() {
        var customItems = ['theme', 'menu'];
        var configJson = grunt.file.readJSON(grunt.config('sourcedir') + 'course/config.json');

        customItems.forEach(function (customItem) {
            // As any theme folder may be used, we need to first find the location of the
            // theme.json file

            //if no theme or menu folder exists, skip
            if (!grunt.file.exists(grunt.config('sourcedir') + customItem + '/')) return;

            var customItemJsonFile;
            grunt.file.recurse(grunt.config('sourcedir') + customItem + '/', function(abspath, rootdir, subdir, filename) {
                if (filename == customItem + '.json') {
                    customItemJsonFile = rootdir + subdir + '/' + filename;
                }
            });

            if (!customItemJsonFile) {
                return;
                //grunt.fail.fatal('Unable to locate ' + customItem + '.json, please ensure a valid ' + customItem + ' exists');
            }

            var customItemJson = grunt.file.readJSON(customItemJsonFile);

            // This effectively combines the JSON
            for (var prop in customItemJson) {
                configJson[prop] = customItemJson[prop];
            }
        });

        grunt.file.write(grunt.config('outputdir') + 'course/config.json', JSON.stringify(configJson));
    });
}
