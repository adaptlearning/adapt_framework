(function() {

    //Test for ie8
    var IE = (function() {
        if (document.documentMode) {
            return document.documentMode;
        }
        return false;
    })();

    //2. Setup require for old style module declarations
    function setupRequireJS() {
        requirejs.config({
            map: {
                '*': {
                    coreJS: 'core/js',
                    coreViews: 'core/js/views',
                    coreModels: 'core/js/models',
                    coreCollections: 'core/js/collections',
                    coreHelpers: 'core/js/helpers',
                    'coreJS/libraries/bowser': 'libraries/bowser',
                    'core/js/libraries/bowser': 'libraries/bowser'
                }
            },
            paths: {
                underscore: 'libraries/underscore',
                backbone: 'libraries/backbone',
                handlebars: 'libraries/handlebars',
                velocity: 'libraries/velocity',
                imageReady: 'libraries/imageReady',
                inview: 'libraries/inview',
                a11y: 'libraries/jquery.a11y',
                scrollTo: 'libraries/scrollTo',
                bowser: 'libraries/bowser'
            }
        });
        loadJQuery();
    }

    //3. Load jquery
    function loadJQuery() {
        Modernizr.load([
            {
                test: IE == 8,
                yep: 'libraries/jquery.js',
                nope: 'libraries/jquery.v2.js',
                complete: checkJQueryStatus
            }
        ]);
    }

    //4. Wait until JQuery gets loaded completly
    function checkJQueryStatus() {
        if(window.jQuery === undefined) {
            setTimeout(checkJQueryStatus, 100);
        } else {
            loadShim();
        }
    }

    //5. Load IE 8 shim
    function loadShim() {
        Modernizr.load([
            {
                test: IE == 8,
                yep: 'libraries/es5-shim.min.js',
                nope: '',
                complete: loadFoundationLibraries()
            }
        ]);
    }

    //6. Load foundation libraries and templates
    function loadFoundationLibraries() {
        require([
            "underscore",
            "backbone",
            "handlebars",
            "velocity",
            "imageReady",
            "inview",
            "a11y",
            "scrollTo",
            "templates"
        ], loadAdapt);
    }

    //7. Load adapt
    function loadAdapt() {
        switch (IE) {
        case 8: case 9:
            //ie8 and ie9 don't do crossdomain with jquery normally
            break;
        default:
            //cross domain support for all other browers
            $.ajaxPrefilter(function( options ) {
                options.crossDomain = true;
            });
        }
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