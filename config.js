require.config({
    paths: {
        jquery: 'core/js/libraries/jquery',
        underscore: 'core/js/libraries/underscore',
        backbone: 'core/js/libraries/backbone',
        modernizr: 'core/js/libraries/modernizr',
        handlebars: 'core/js/libraries/handlebars',
        velocity: 'core/js/libraries/velocity',
        imageReady: 'core/js/libraries/imageReady',
        inview: 'core/js/libraries/inview',
        scrollTo: 'core/js/libraries/scrollTo',
        coreJS: 'core/js',
        coreViews: 'core/js/views',
        coreModels: 'core/js/models',
        coreCollections: 'core/js/collections',
        coreHelpers: 'core/js/helpers',
        templates: 'templates/templates'
    },
    shim: {
        jquery: [

        ],
        backbone: {
            deps: [
                'underscore',
                'jquery'
            ],
            exports: 'Backbone'
        },
        underscore: {
            exports: '_'
        },
        handlebars: {
            exports: 'Handlebars'
        },
        velocity: {
            deps: [
                'jquery'
            ],
            exports: 'velocity'
        },
        imageReady: {
            deps: [
                'jquery'
            ],
            exports: 'imageready'
        },
        inview: {
            deps: [
                'jquery'
            ],
            exports: 'inview'
        },
        scrollTo: {
            deps: [
                'jquery'
            ],
            exports: 'scrollTo'
        }
    }
});