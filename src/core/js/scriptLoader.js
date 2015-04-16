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

    //Load foundation libraries, json2, consoles, swfObject
    Modernizr.load([
        {
            test: window.JSON,
            nope: 'libraries/json2.js'
        },
        {
            test: IE == 8,
            yep: 'libraries/jquery.js',
            nope: 'libraries/jquery.v2.js'
        },
        {
            test: window.console == undefined,
            yep: 'libraries/consoles.js',
            complete: function() {

                //Inject require js for dependency loading
                yepnope.injectJs("libraries/require.js", function () { 
                }, {
                    type:"text/javascript",
                    language:"javascript",
                    "data-main":"adapt/js/adapt.min.js"
                }, 5000);
            }
        }
    ]);

})();
