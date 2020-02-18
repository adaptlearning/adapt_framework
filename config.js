require.config({
  paths: {
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
    'coreJS/libraries/bowser': 'empty:'
  },
  map: {
    '*': {
      coreJS: 'core/js',
      coreViews: 'core/js/views',
      coreModels: 'core/js/models',
      coreCollections: 'core/js/collections',
      coreHelpers: 'core/js/helpers'
    }
  }
});
