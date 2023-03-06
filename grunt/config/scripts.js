module.exports = function(grunt, options) {
  return {
    options: {
      outputdir: '<%= outputdir %>',
      sourcedir: '<%= sourcedir %>',
      plugins: [
        '<%= sourcedir %>node_modules/adapt-*/pacakge.json'
      ],
      pluginsFilter: function(filepath) {
        return grunt.option('helpers').includedFilter(filepath) && grunt.option('helpers').scriptSafeFilter(filepath);
      },
      pluginsOrder: grunt.option('helpers').orderFilesByPluginType
    }
  };
};
