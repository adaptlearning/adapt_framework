define(['coreJS/adapt'],function(Adapt) {

    describe('Adapt', function() {
        
        it('should allow me to send events', function() {
            
            var adaptEventSent = false;
        
            Adapt.on('testing:adapt', function() {
                adaptEventSent = true;
            });
            
            Adapt.trigger('testing:adapt');
            
            expect(adaptEventSent).to.be(true);
            
        });
    });
    
    describe('Adapt', function() {
        it('should only run initialize once', function() {
            
            var adaptInitialize = 0;
            
            Adapt.on("adapt:initialize", function() {
                adaptInitialize ++;
            });
            
            Adapt.initialize();
            Adapt.initialize();
            
            expect(adaptInitialize).to.equal(1);
        });
    });

});
