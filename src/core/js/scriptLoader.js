/*
* ScriptLoader
* License - https://github.com/adaptlearning/adapt_framework/blob/master/LICENSE
* Maintainers - Daryl Hedley
*/
(function() {

    var loadRequireJS = function() {
        //Inject require js for dependency loading
        yepnope.injectJs("libraries/require.js", function () { 

            loadJQuery();

        }, {
            type:"text/javascript",
            language:"javascript"
        }, 5000);
    };

    var loadJQuery = function() {
        //Choose jquery for ie8 or other
        
        Modernizr.load([
            {
                test: IE == 8,
                yep: 'libraries/jquery.js',
                nope: 'libraries/jquery.v2.js'
            },

            //Load adapt once finished
            "adapt/js/adapt.min.js"
        ]);
    };

    //Load foundation libraries, json2, consoles
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

    //Test for ie8
    var IE = (function() { 
        if (document.documentMode) {
            return document.documentMode;
        }
        return false;
    })();

})();
