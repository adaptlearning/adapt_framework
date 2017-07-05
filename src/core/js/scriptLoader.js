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
                jquery: 'libraries/jquery.v2',
                underscore: 'libraries/underscore',
                backbone: 'libraries/backbone',
                'backbone.controller': 'libraries/backbone.controller',
                handlebars: 'libraries/handlebars',
                velocity: 'libraries/velocity',
                imageReady: 'libraries/imageReady',
                inview: 'libraries/inview',
                a11y: 'libraries/jquery.a11y',
                scrollTo: 'libraries/scrollTo',
                bowser: 'libraries/bowser',
                'enum': 'libraries/enum'
            }
        });
        loadFoundationLibraries();
    }

    //3. Load foundation libraries and templates
    function loadFoundationLibraries() {
        require([
            "jquery",
            "underscore",
            "backbone",
            "backbone.controller",
            "handlebars",
            "velocity",
            "imageReady",
            "inview",
            "a11y",
            "scrollTo",
            "bowser",
            "enum",
            "templates"
        ], loadAdapt);
    }

    //4. Load adapt
    function loadAdapt() {
        //cross domain support for all other browers
        $.ajaxPrefilter(function( options ) {
            options.crossDomain = true;
        });
        Modernizr.load("adapt/js/adapt.min.js");
    }

    //1. Load foundation libraries, json2, consoles, requirejs
    Modernizr.load([
        {
            test: window.JSON,
            nope: 'libraries/json2.js'
        },
        {
            test: window.console == undefined,
            yep: 'libraries/consoles.js'
        },
        {
            load: "libraries/require.js",
            complete: setupRequireJS
        }
    ]);

})();
