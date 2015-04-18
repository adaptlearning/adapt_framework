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
        a11y: 'core/js/libraries/jquery.a11y',
        scrollTo: 'core/js/libraries/scrollTo',
        coreJS: 'core/js',
        coreViews: 'core/js/views',
        coreModels: 'core/js/models',
        coreCollections: 'core/js/collections',
        coreHelpers: 'core/js/helpers',
        templates: 'templates/templates'
    },
    shim: {
        jquery: {
            exports: '$'
        },
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
            ]
        },
        imageReady: {
            deps: [
                'jquery'
            ]
        },
        inview: {
            deps: [
                'jquery'
            ]
        },
        scrollTo: {
            deps: [
                'jquery'
            ]
        },
        a11y: {
            deps: [
                'jquery'
            ]
        }
    },
    packages: [

    ],
    exclude: [
        'jquery'
    ]
});
