//if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(function(require) {
    var Adapt = require('coreJS/adapt');
    
    describe("Adapt initialize", function(){
        
        it('should only fire once', function() {
            var count = 0;
            Adapt.on('adapt:initialize', function() {
                count++;
            });
            Adapt.initialize();
            Adapt.initialize();
            expect(count).to.equal(1);
        });
        
    });
});

