module.exports = function(grunt, options) {
  return {
    dev: {
      options: {
        name: 'adapt-contrib-core/js/app',
        baseUrl: '<%= sourcedir %>node_modules/',
        out: '<%= outputdir %>adapt/js/adapt.min.js',
        cachePath: '<%= outputdir %>.cache',
        // fetch these bower plugins an add them as dependencies to the app.js
        plugins: [
          '<%= sourcedir %>/node_modules/adapt-*/package.json',
          '<%= sourcedir %>/node_modules/adapt-*/bower.json'
        ],
        pluginsPath: '<%= sourcedir %>/node_modules/plugins.js',
        pluginsModule: 'plugins',
        pluginsFilter: filepath => grunt.option('helpers').includedFilter(filepath),
        pluginsOrder: grunt.option('helpers').orderFilesByPluginType,
        reactTemplates: [
          '<%= sourcedir %>node_modules/adapt-*/templates/**/*.jsx'
        ],
        generateSourceMaps: true
      },
      // newer configuration
      files: {
        '<%= outputdir %>adapt/js/adapt.min.js': [
          '<%= sourcedir %>/node_modules/adapt-*/**/*.js',
          '<%= sourcedir %>/node_modules/adapt-*/**/*.jsx'
        ]
      }
    },
    compile: {
      options: {
        name: 'adapt-contrib-core/js/app',
        baseUrl: '<%= sourcedir %>node_modules/',
        out: '<%= outputdir %>adapt/js/adapt.min.js',
        cachePath: '<%= outputdir %>.cache',
        // fetch these bower plugins an add them as dependencies to the app.js
        plugins: [
          '<%= sourcedir %>/node_modules/adapt-*/package.json',
          '<%= sourcedir %>/node_modules/adapt-*/bower.json'
        ],
        pluginsPath: '<%= sourcedir %>/node_modules/plugins.js',
        pluginsModule: 'plugins',
        pluginsFilter: filepath => grunt.option('helpers').includedFilter(filepath),
        pluginsOrder: grunt.option('helpers').orderFilesByPluginType,
        reactTemplates: [
          '<%= sourcedir %>node_modules/adapt-*/templates/**/*.jsx'
        ]
      }
    }
  };
};
