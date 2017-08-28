(function() {

    //2. Setup require for old style module declarations
    function setupRequireJS() {
        requirejs.config({
            map: {
                '*': {
                    coreJS: 'core/js',
                    coreViews: 'core/js/views',
                    coreModels: 'core/js/models',
                    coreCollections: 'core/js/collections'
                }
            },
            paths: {
                jquery: 'libraries/jquery.v2.min',
                underscore: 'libraries/underscore.min',
                backbone: 'libraries/backbone.min',
                'backbone.controller': 'libraries/backbone.controller',
                handlebars: 'libraries/handlebars.min',
                velocity: 'libraries/velocity.min',
                imageReady: 'libraries/imageReady',
                inview: 'libraries/inview',
                a11y: 'libraries/jquery.a11y',
                scrollTo: 'libraries/scrollTo.min',
                bowser: 'libraries/bowser',
                'enum': 'libraries/enum',
                jqueryMobile: 'libraries/jquery.mobile.custom'
            }
        });
        loadFoundationLibraries();
    }
    
    //3. Load foundation libraries and templates
    function loadFoundationLibraries() {
        require([
            'jquery',
            'underscore',
            'backbone',
            'backbone.controller',
            'handlebars',
            'velocity',
            'imageReady',
            'inview',
            'jqueryMobile',
            'a11y',
            'scrollTo',
            'bowser',
            'enum',
            'templates'
        ], loadAdapt);
    }

    //4. Load adapt
    function loadAdapt() {
        $.ajaxPrefilter(function( options ) {
            options.crossDomain = true;
        });
        Modernizr.load('adapt/js/adapt.min.js');
    }

    //1. Load foundation libraries, json2, consoles, requirejs
    Modernizr.load([
        {
            test: window.JSON,
            nope: 'libraries/json2.min.js'
        },
        {
            test: window.console == undefined,
            yep: 'libraries/consoles.min.js'
        },
        {
            load: 'libraries/require.min.js',
            complete: setupRequireJS
        }
    ]);

})();
