require.config({
    paths: {
        jquery: 'components/jquery/jquery',
        underscore: 'components/underscore/underscore',
        backbone: 'components/backbone/backbone',
        modernizr: 'core/js/libraries/modernizr',
        handlebars: 'core/js/libraries/handlebars',
        imageReady: 'core/js/libraries/imageReady',
        inview: 'core/js/libraries/inview',
        scrollTo: 'core/js/libraries/scrollTo',
        coreJS: 'core/js',
        coreViews: 'core/js/views',
        coreModels: 'core/js/models',
        coreCollections: 'core/js/collections',
        templates: 'templates/templates'
    },
    shim: {
        jquery: [

        ],
        backbone: {
            deps: [
                'core/js/libraries/underscore',
                'core/js/libraries/jquery.v2'
            ],
            exports: 'Backbone'
        },
        underscore: {
            exports: '_'
        },
        handlebars: {
            exports: 'Handlebars'
        }
    }
});