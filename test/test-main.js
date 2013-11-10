var tests = [];
for (var file in window.__karma__.files) {
    if (/spec\//.test(file)) {
        tests.push(file);
    }
}

requirejs.config({
    baseUrl: '/base/src',
    paths: {
        jquery: 'core/js/libraries/jquery',
        underscore: 'core/js/libraries/underscore',
        backbone: 'core/js/libraries/backbone',
        modernizr: 'core/js/libraries/modernizr',
        handlebars: 'core/js/libraries/handlebars',
        imageReady: 'core/js/libraries/imageReady',
        inview: 'core/js/libraries/inview',
        scrollTo: 'core/js/libraries/scrollTo',
        coreJS: 'core/js',
        coreViews: 'core/js/views',
        coreModels: 'core/js/models',
        coreCollections: 'core/js/collections',
        templates: 'templates/templates',
        spec: '../test/spec'
    },
    shim: {
        jquery: [],
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
        }
    },
    deps: tests,
    callback: window.__karma__.start
});
