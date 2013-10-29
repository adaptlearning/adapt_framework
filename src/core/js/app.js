require([
    "backbone",
    "handlebars",
    "coreJS/adapt",
    "coreJS/utils",
    "coreJS/router",
    "coreViews/nav",
    "components",
], function(Backbone, Handlebars, Adapt, Utils, Router, Nav) {
    
    Backbone.history.start();
    
    Adapt.initialize();
    
    Adapt.create('nav', 'view');
    
    Adapt.create('helloWorld', 'view');
    Adapt.create('helloWorld2', 'view');
    
    /*Modernizr.load([
        {
            test: window.JSON,
            nope: 'core/js/libraries/json2.js'
        },
        {
            test: Modernizr.video || Modernizr.audio,
            nope: 'core/js/libraries/swfObject.js'
        },
        {
            test: function() {if (document.getElementsByTagName('html')[0].className.indexOf('ie8') 
            || document.getElementsByTagName('html')[0].className.indexOf('ie7')) return true},
            yep: ['core/js/libraries/jquery.v1.js', 'core/css/legacy.css'],
            nope: ['core/js/libraries/jquery.v2.js','core/css/responsive.css']
        },
        {
            load:[
                'core/js/adapt.js'
            ],
            complete: function() {
                ADAPT.create('manager','model');
            }
        }
    ]);*/
    
});