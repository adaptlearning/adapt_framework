module.exports = function (grunt, options) {
    return {
        options:{
            baseUrl: '<%= sourcedir %>',
            src: [
                '<%= sourcedir %>components/**/bower.json',
                '<%= sourcedir %>extensions/**/bower.json',
                '<%= sourcedir %>menu/<%= menu %>/**/bower.json',                    
                '<%= sourcedir %>theme/<%= theme %>/**/bower.json'
            ],
            filter: function(filepath) {
                return grunt.config('helpers').includedFilter(filepath);
            }
        }
    };
};
