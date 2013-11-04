require.config({
    paths: {
        jquery: 'core/js/libraries/jquery.v2',
        underscore: 'core/js/libraries/underscore',
        backbone: 'core/js/libraries/backbone',
        modernizr: 'core/js/libraries/modernizr',
        handlebars: 'core/js/libraries/handlebars',
        imageReady: 'core/js/libraries/imageReady',
        inview: 'core/js/libraries/inview',
        scrollTo: 'core/js/libraries/scrollTo',
        coreJS: 'core/js',
        coreViews: 'core/js/views',
        templates: '../build/templates/templates'
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