(function() {

    function loadScript(url, callback){
        if (!url || typeof url !== 'string') return;
        var script = document.createElement('script');
        script.onload = callback;
        script.src = url;
        document.getElementsByTagName('head')[0].appendChild(script);
    };

    //0. Keep loadScript code to add into Adapt API later
    window.__loadScript = loadScript;

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
                jquery: 'libraries/jquery.min',
                underscore: 'libraries/underscore.min',
                'underscore.results': 'libraries/underscore.results',
                backbone: 'libraries/backbone.min',
                'backbone.controller': 'libraries/backbone.controller',
                'backbone.controller.results': 'libraries/backbone.controller.results',
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
        loadScript('libraries/jquery.min.js', checkJQueryStatus);
    }

    //4. Wait until JQuery gets loaded completely then load foundation libraries
    function checkJQueryStatus() {
        if(window.jQuery === undefined) {
            setTimeout(checkJQueryStatus, 100);
        } else {
            setupModernizr();
        }
    }

    //5. Backward compatibility for Modernizr
    function setupModernizr() {
        Modernizr.touch = Modernizr.touchevents;
        var touchClass = Modernizr.touch ? 'touch' : 'no-touch';
        $("html").addClass(touchClass);
        loadFoundationLibraries();
    }

    //6. Load foundation libraries and templates then load Adapt itself
    function loadFoundationLibraries() {
        require([
            'underscore',
            'underscore.results',
            'backbone',
            'backbone.controller',
            'backbone.controller.results',
            'handlebars',
            'velocity',
            'imageReady',
            'inview',
            'jqueryMobile',
            'libraries/jquery.resize',
            'a11y',
            'scrollTo',
            'bowser',
            'enum',
            'templates'
        ], loadAdapt);
    }

    //7. Allow cross-domain AJAX then load Adapt
    function loadAdapt() {
        $.ajaxPrefilter(function( options ) {
            options.crossDomain = true;
        });
        loadScript('adapt/js/adapt.min.js');
    }

    //1. Load requirejs then set it up
    loadScript('libraries/require.min.js', setupRequireJS);

})();
