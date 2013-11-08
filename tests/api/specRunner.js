require.config({
    baseUrl: '',
    paths: {
        'jquery': '../../src/core/js/libraries/jquery',
        'underscore': '../../src/core/js/libraries/underscore',
        'backbone': '../../src/core/js/libraries/backbone',
        'mocha': '../src/mocha',
        'expect': '../src/expect',
        'coreJS':'../../src/core/js',
        'coreModels':'../../src/core/js/models'
    },
    shim: {
        'underscore': {
            exports: '_'
        },
        'jquery': {
            exports: '$'
        },
        'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        'mocha': {
            exports: 'mocha'
        },
        'expect': {
            exports: 'expect'
        }
    },
    urlArgs: 'bust=' + (new Date()).getTime()
});
 
require(['require', 'expect', 'mocha', 'jquery'], function(require, expect, mocha, jquery){
    // Chai
    /*var should = chai.should();
    chai.use(chaiJquery);*/
 
    /*globals mocha */
    mocha.setup('bdd');
    mocha.checkLeaks();
    mocha.globals(['jQuery']);
 
    require([
        'api.js',
        'models.js'
    ], function(require) {
        mocha.run();
    });
 
});