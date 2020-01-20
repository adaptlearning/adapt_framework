module.exports = function(grunt, options) {
  return {
    options: {
      outputdir: '<%= outputdir %>',
      sourcedir: '<%= sourcedir %>',
      plugins: [
        '<%= sourcedir %>components/*/bower.json',
        '<%= sourcedir %>extensions/*/bower.json',
        '<%= sourcedir %>menu/<%= menu %>/bower.json',
        '<%= sourcedir %>theme/<%= theme %>/bower.json'
      ],
      pluginsFilter: function(filepath) {
        return grunt.config('helpers').includedFilter(filepath) && grunt.config('helpers').scriptSafeFilter(filepath);
      }
    }
  };
};
