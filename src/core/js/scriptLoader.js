/*
* ScriptLoader
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Daryl Hedley
*/

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
        test: Modernizr.video || Modernizr.audio,
        nope: 'libraries/swfObject.js',
        complete: function() {
            yepnope.injectJs("libraries/require.js", function () {   
            }, {
                type:"text/javascript",
                language:"javascript",
                "data-main":"adapt/js/adapt.min.js"
            }, 5000);
        }
    }
]);