/*var expect = require("expect.js");
var requirejs = require('requirejs');

requirejs.config({
    baseUrl: __dirname,
    nodeRequire: require
});
//var Adapt = require('../src/core/js/adapt.js');
//console.log('running');
//console.log(Adapt);

var Adapt = requirejs('../build/adapt/js/adapt.min');
console.log(Adapt);

requirejs(['./src/core/js/adapt.js'], function(Adapt) {

    console.log('running');
    
    var eventStatus = false;
    
    Adapt.on('event:test', function() {
        eventStatus = true;
    });
    
    describe("Adapt events", function(){
        it("should trigger events", function(){
            expect(eventStatus).to.equal(false);
        });
    });
    
});*/