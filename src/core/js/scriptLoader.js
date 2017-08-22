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
                    coreCollections: 'core/js/collections'
                }
            },
            paths: {
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
        loadJQuery();
    }

    //3. Load jquery
    function loadJQuery() {
        Modernizr.load([
            {
                test: IE == 8,
                yep: 'libraries/jquery.min.js',
                nope: 'libraries/jquery.v2.min.js',
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

        var isIE8 = (IE == 8);

        Modernizr.load([
            {
                test: isIE8,
                yep: 'libraries/es5-shim.min.js',
                nope: '',
                complete: loadFoundationLibraries()
            }
        ]);

        if (isIE8) {
            fixIE8ConsoleLog();
        }

    }

    function fixIE8ConsoleLog() {

        console.log = Function.prototype.call.bind(console.log, console);

    }

    //6. Load foundation libraries and templates
    function loadFoundationLibraries() {
        require([
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
        Modernizr.load('adapt/js/adapt.min.js');
    }

    //1. Load foundation libraries, consoles, requirejs
    Modernizr.load([
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
