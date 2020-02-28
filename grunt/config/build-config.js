module.exports = function(grunt, options) {
  return {
    options: {
      filter: function(filepath) {
        return grunt.config('helpers').includedFilter(filepath);
      },
      allowedProperties: {
        bower: [
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
        ],
        package: [
          'name',
          'version',
          'description',
          'repository',
          'license'
        ]
      }
    }
  };
};
