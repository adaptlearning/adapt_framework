module.exports = function(grunt, options) {
  return {
    options: {
      filter: function(filepath) {
        return grunt.config('helpers').includedFilter(filepath);
      },
      allowedProperties: {
        package: [
          'name',
          'version',
          'framework',
          'displayName',
          'theme',
          'component',
          'extension',
          'menu',
          'description',
          'main',
          'keywords',
          'licence'
        ]
      }
    }
  };
};
