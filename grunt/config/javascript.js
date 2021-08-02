module.exports = function(grunt, options) {
  return {
    dev: {
      options: {
        name: 'core/js/app',
        baseUrl: '<%= sourcedir %>',
        out: '<%= outputdir %>adapt/js/adapt.min.js',
        cachePath: '<%= outputdir %>.cache',
        // fetch these bower plugins an add them as dependencies to the app.js
        plugins: [
          '<%= sourcedir %>components/*/bower.json',
          '<%= sourcedir %>extensions/*/bower.json',
          '<%= sourcedir %>menu/<%= menu %>/bower.json',
          '<%= sourcedir %>theme/<%= theme %>/bower.json'
        ],
        pluginsPath: '<%= sourcedir %>plugins.js',
        pluginsModule: 'plugins',
        pluginsFilter: function(filepath) {
          return grunt.config('helpers').includedFilter(filepath);
        },
        umdImports: [
        ],
        reactTemplates: [
          '<%= sourcedir %>core/templates/**/*.jsx',
          '<%= sourcedir %>components/*/templates/**/*.jsx',
          '<%= sourcedir %>extensions/*/templates/**/*.jsx',
          '<%= sourcedir %>menu/*/templates/**/*.jsx',
          '<%= sourcedir %>theme/*/templates/**/*.jsx'
        ],
        externalMap: {
          '.*/libraries/(?!mediaelement-fullscreen-hook)+': 'libraries/'
        },
        external: {
          jquery: 'empty:',
          underscore: 'empty:',
          backbone: 'empty:',
          modernizr: 'empty:',
          handlebars: 'empty:',
          velocity: 'empty:',
          imageReady: 'empty:',
          inview: 'empty:',
          a11y: 'empty:',
          scrollTo: 'empty:',
          libraries: 'empty:',
          bowser: 'empty:',
          'core/js/libraries/bowser': 'empty:',
          'coreJS/libraries/bowser': 'empty:',
          react: 'empty:',
          'react-dom': 'empty:',
          'object.assign': 'empty:',
          'html-react-parser': 'empty:',
          semver: 'empty:'
        },
        map: {
          coreJS: 'core/js',
          coreViews: 'core/js/views',
          coreModels: 'core/js/models',
          coreCollections: 'core/js/collections',
          coreHelpers: 'core/js/helpers',
          // This library from the media component has a circular reference to core/js/adapt, it should be loaded after Adapt
          // It needs to be moved from the libraries folder to the js folder
          'libraries/mediaelement-fullscreen-hook': '../libraries/mediaelement-fullscreen-hook'
        },
        generateSourceMaps: true
      },
      // newer configuration
      files: {
        '<%= outputdir %>adapt/js/adapt.min.js': [
          '<%= sourcedir %>/**/*.js',
          '<%= sourcedir %>/**/*.jsx'
        ]
      }
    },
    compile: {
      options: {
        name: 'core/js/app',
        baseUrl: '<%= sourcedir %>',
        out: '<%= outputdir %>adapt/js/adapt.min.js',
        cachePath: '<%= outputdir %>.cache',
        // fetch these bower plugins an add them as dependencies to the app.js
        plugins: [
          '<%= sourcedir %>components/*/bower.json',
          '<%= sourcedir %>extensions/*/bower.json',
          '<%= sourcedir %>menu/<%= menu %>/bower.json',
          '<%= sourcedir %>theme/<%= theme %>/bower.json'
        ],
        pluginsPath: '<%= sourcedir %>/plugins.js',
        pluginsModule: 'plugins',
        pluginsFilter: function(filepath) {
          return grunt.config('helpers').includedFilter(filepath);
        },
        umdImports: [
        ],
        reactTemplates: [
          '<%= sourcedir %>core/templates/**/*.jsx',
          '<%= sourcedir %>components/*/templates/**/*.jsx',
          '<%= sourcedir %>extensions/*/templates/**/*.jsx',
          '<%= sourcedir %>menu/*/templates/**/*.jsx',
          '<%= sourcedir %>theme/*/templates/**/*.jsx'
        ],
        externalMap: {
          '.*/libraries/(?!mediaelement-fullscreen-hook)+': 'libraries/'
        },
        external: {
          jquery: 'empty:',
          underscore: 'empty:',
          backbone: 'empty:',
          modernizr: 'empty:',
          handlebars: 'empty:',
          velocity: 'empty:',
          imageReady: 'empty:',
          inview: 'empty:',
          a11y: 'empty:',
          scrollTo: 'empty:',
          libraries: 'empty:',
          bowser: 'empty:',
          'core/js/libraries/bowser': 'empty:',
          'coreJS/libraries/bowser': 'empty:',
          react: 'empty:',
          'react-dom': 'empty:',
          'object.assign': 'empty:',
          'html-react-parser': 'empty:',
          semver: 'empty:'
        },
        map: {
          coreJS: 'core/js',
          coreViews: 'core/js/views',
          coreModels: 'core/js/models',
          coreCollections: 'core/js/collections',
          coreHelpers: 'core/js/helpers',
          // This library from the media component has a circular reference to core/js/adapt, it should be loaded after Adapt
          // It needs to be moved from the libraries folder to the js folder
          'libraries/mediaelement-fullscreen-hook': '../libraries/mediaelement-fullscreen-hook'
        }
      }
    }
  };
};
