(function() {

    //Test for ie8
    var IE = (function() {
        if (document.documentMode) {
            return document.documentMode;
        }
        return false;
    })();

    //2. Load jquery
    function loadJQuery() {
        Modernizr.load([
            {
                test: IE == 8,
                yep: 'libraries/jquery.js',
                nope: 'libraries/jquery.v2.js',
                complete: loadAdapt
            }
        ]);
    }

    //3. Load adapt
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
            complete: loadJQuery
        }
    ]);

})();
