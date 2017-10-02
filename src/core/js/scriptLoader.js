(function() {

    //2. Setup require for old-style module declarations (some code still uses these), configure paths then load JQuery
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
        loadJQuery();
    }

    // 3. start loading JQuery, wait for it to be loaded
    function loadJQuery() {
        Modernizr.load([
            {
                load: 'libraries/jquery.v2.min.js',
                complete: checkJQueryStatus
            }
        ]);
    }

    //4. Wait until JQuery gets loaded completely then load foundation libraries
    function checkJQueryStatus() {
        if(window.jQuery === undefined) {
            setTimeout(checkJQueryStatus, 100);
        } else {
            loadFoundationLibraries();
        }
    }
    
    //5. Load foundation libraries and templates then load Adapt itself
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

    //6. Allow cross-domain AJAX then load Adapt
    function loadAdapt() {
        $.ajaxPrefilter(function( options ) {
            options.crossDomain = true;
        });
        Modernizr.load('adapt/js/adapt.min.js');
    }

    //1. Load requirejs then set it up
    Modernizr.load([
        {
            load: 'libraries/require.min.js',
            complete: setupRequireJS
        }
    ]);

})();
