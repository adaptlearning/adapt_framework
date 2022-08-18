module.exports = function(grunt, options) {
  return {
    dev: {
      options: {
        baseUrl: '<%= sourcedir %>node_modules/',
        out: '<%= outputdir %>adapt/js/adapt.min.js',
        cachePath: '<%= outputdir %>.cache',
        plugins: [
          '<%= sourcedir %>/node_modules/adapt-*/package.json',
          '<%= sourcedir %>/node_modules/adapt-*/*/bower.json'
        ],
        pluginsFilter: function(filepath) {
          return grunt.option('helpers').includedFilter(filepath);
        },
        reactTemplates: [
          '<%= sourcedir %>/node_modules/adapt-*/templates/**/*.jsx'
        ],
        externalMap: {
          '.*/libraries/(?!mediaelement-fullscreen-hook)+': 'libraries/'
        },
        external: {
          libraries: 'empty:'
        },
        map: {
          // This library from the media component has a circular reference to core/js/adapt, it should be loaded after Adapt
          // It needs to be moved from the libraries folder to the js folder
          'libraries/mediaelement-fullscreen-hook': '../libraries/mediaelement-fullscreen-hook'
        },
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
        baseUrl: '<%= sourcedir %>node_modules/',
        out: '<%= outputdir %>adapt/js/adapt.min.js',
        cachePath: '<%= outputdir %>.cache',
        plugins: [
          '<%= sourcedir %>/node_modules/adapt-*/*/package.json',
          '<%= sourcedir %>/node_modules/adapt-*/*/bower.json'
        ],
        pluginsFilter: function(filepath) {
          return grunt.option('helpers').includedFilter(filepath);
        },
        reactTemplates: [
          '<%= sourcedir %>/node_modules/adapt-*/templates/**/*.jsx'
        ],
        externalMap: {
          '.*/libraries/(?!mediaelement-fullscreen-hook)+': 'libraries/'
        },
        external: {
          libraries: 'empty:'
        },
        map: {
          // This library from the media component has a circular reference to core/js/adapt, it should be loaded after Adapt
          // It needs to be moved from the libraries folder to the js folder
          'libraries/mediaelement-fullscreen-hook': '../libraries/mediaelement-fullscreen-hook'
        }
      }
    }
  };
};
