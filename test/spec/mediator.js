define(function(require) {

    var Adapt = require('coreJS/adapt');
    var Mediator = require('coreJS/mediator');

    describe('Mediator', function() {
        
        it('should allow me to attach a default callback function to an event', function() {
            
            var mediatorEventSent = false;
        
            Adapt.mediator.default('testing:mediator', function() {
                mediatorEventSent = true;
            });
            
            Adapt.trigger('testing:mediator');
            
            expect(mediatorEventSent).to.be(true);
            
        });

        it('should allow me to pass attributes from an Adapt trigger into the default mediator callback', function() {

            var feedback = {
                title: "A title for feedback",
                body: "Body text for feedback"
            }

            Adapt.mediator.default('testing:mediator', function(attributes) {
                expect(attributes.title).to.equal("A title for feedback");
            });

            Adapt.trigger('testing:mediator', feedback);

        });

        it('should allow me to stop the default callback from calling', function() {

            var mediatorPreventDefault = true;

            Adapt.mediator.default('testing:mediator', function() {
                mediatorPreventDefault = false;
            });

            Adapt.mediator.on('testing:mediator', function(event) {
                event.preventDefault();
                expect(mediatorPreventDefault).to.be(true);
                
            })

            Adapt.trigger('testing:mediator');

        });

        it('should allow me to call the default callback if no event.preventDefault() is called', function() {

            var mediatorPreventDefault = true;

            Adapt.mediator.default('testing:mediator', function() {
                mediatorPreventDefault = false;
                expect(mediatorPreventDefault).to.be(false);
            });

            Adapt.mediator.on('testing:mediator', function(event) {
            })

            Adapt.trigger('testing:mediator');

        });

        it('should allow me to pass attributes from the original event into the attached mediator callbacks', function() {

            var feedback = {
                title: "A title for feedback",
                body: "Body text for feedback"
            }

            Adapt.mediator.default('testing:mediator', function(attributes) {
            });

            Adapt.mediator.on('testing:mediator', function(event, attributes) {
                expect(attributes.body).to.equal("Body text for feedback");
            })

            Adapt.trigger('testing:mediator', feedback);

        });

        it('should allow me to pass attributes from the original event into the attached mediator callbacks & prevent the default callback', function() {

            var mediatorPreventDefault = true;

            var feedback = {
                title: "A title for feedback",
                body: "Body text for feedback"
            }

            Adapt.mediator.default('testing:mediator', function(attributes) {
                mediatorPreventDefault = false;
            });

            Adapt.mediator.on('testing:mediator', function(event, attributes) {
                event.preventDefault();
                expect(attributes.body + " " + mediatorPreventDefault).to.equal("Body text for feedback true");
            })

            Adapt.trigger('testing:mediator', feedback);

        });

    });

});
