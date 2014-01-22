/*
* ScriptLoader
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Daryl Hedley
*/

Modernizr.load([
    {
        test: window.JSON,
        nope: 'core/js/libraries/json2.js'
    },
    {
        test: navigator.userAgent.match(/MSIE\s(?!9.0)/),
        nope: 'core/js/libraries/consoles.js'
    },
    {
        test: Modernizr.video || Modernizr.audio,
        nope: 'core/js/libraries/swfObject.js',
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