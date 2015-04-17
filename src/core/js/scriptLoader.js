/*
* ScriptLoader
* License - https://github.com/adaptlearning/adapt_framework/blob/master/LICENSE
* Maintainers - Daryl Hedley
*/
(function() {

    //Test for ie8
    var IE = (function() { 
        if (document.documentMode) {
            return document.documentMode;
        }
        return false;
    })();

    //2. Load requirejs
    function loadRequireJS() {
        Modernizr.load([
            {
                load: "libraries/require.js",
                complete: loadJQuery
            }
        ]);
    }

    //3. Load jquery
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

    //4. Load adapt
    function loadAdapt() {
        Modernizr.load("adapt/js/adapt.min.js");
    }

    //1. Load foundation libraries, json2, consoles
    Modernizr.load([
        {
            test: window.JSON,
            nope: 'libraries/json2.js'
        },
        {
            test: window.console == undefined,
            yep: 'libraries/consoles.js',
            complete: loadRequireJS
        }
    ]);

})();
