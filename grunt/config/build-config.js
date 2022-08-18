module.exports = function(grunt) {
  return {
    options: {
      filter: filepath => grunt.option('helpers').includedFilter(filepath),
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
