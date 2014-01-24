module.exports = function (grunt) {
    // This is a simple function to take the course's config.json and append the theme.json
    grunt.registerTask('create-json-config', 'Creating config.json', function() {

        var themeJsonFile = '';

        // As any theme folder may be used, we need to first find the location of the
        // theme.json file
        grunt.file.recurse('src/theme/', function(abspath, rootdir, subdir, filename) {
            if (filename == 'theme.json') {
                themeJsonFile = rootdir + subdir + '/' + filename;
            }
        });

        if (themeJsonFile == '') {
            grunt.fail.fatal("Unable to locate theme.json, please ensure a valid theme exists");
        }

        var configJson = grunt.file.readJSON('src/course/config.json');
        var themeJson = grunt.file.readJSON(themeJsonFile);

        // This effectively combines the JSON   
        for (var prop in themeJson) {           
            configJson[prop] = themeJson[prop];
        }

        grunt.file.write('src/course/config.json', JSON.stringify(configJson));
    });
}