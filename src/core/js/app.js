/*globals define*/
define(['modernizr', 'components', 'extensions', 'menu', 'theme'], function (Modernizr) {
    
    Modernizr.load([
        {
            test: window.JSON,
            nope: 'core/js/vendor/json2.js'
        },
        {
            test: Modernizr.video || Modernizr.audio,
            nope: 'core/js/vendor/swfObject.js'
        },
        {
            test: /ie[78]/.test(document.getElementsByTagName("html")[0].className),
            yep: 'core/css/legacy.css',
            nope: 'core/css/responsive.css'
        },
        {
            load:[
                'core/js/adapt.js'
            ]
        }
    ]);

});
