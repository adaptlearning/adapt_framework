define(function(require) {

    var Adapt = require('coreJS/adapt');
    var Mediator = require('coreJS/mediator');

    describe('Mediator', function() {
        
        it('should allow me to attach a default callback function to an event', function() {
            
            var mediatorEventSent = false;
        
            Adapt.mediator.default('testing:mediatorOne', function() {
                mediatorEventSent = true;
            });
            
            Adapt.trigger('testing:mediatorOne');
            
            expect(mediatorEventSent).to.be(true);
            
        });

        it('should allow me to pass attributes from an Adapt trigger into the default mediator callback', function() {

            var feedback = {
                title: "A title for feedback",
                body: "Body text for feedback"
            }

            Adapt.mediator.default('testing:mediatorTwo', function(attributes) {
                expect(attributes.title).to.equal("A title for feedback");
            });

            Adapt.trigger('testing:mediatorTwo', feedback);

        });

        it('should allow me to stop the default callback from calling', function() {

            var mediatorPreventDefault = true;

            Adapt.mediator.default('testing:mediatorThree', function() {
                mediatorPreventDefault = false;
            });

            Adapt.mediator.on('testing:mediatorThree', function(event) {
                event.preventDefault();
                expect(mediatorPreventDefault).to.be(true);
                
            })

            Adapt.trigger('testing:mediatorThree');

        });

        it('should allow me to call the default callback if no event.preventDefault() is called', function() {

            var mediatorPreventDefault = true;

            Adapt.mediator.default('testing:mediatorFour', function() {
                mediatorPreventDefault = false;
                expect(mediatorPreventDefault).to.be(false);
            });

            Adapt.mediator.on('testing:mediatorFour', function(event) {
            })

            Adapt.trigger('testing:mediatorFour');

        });

        it('should allow me to pass attributes from the original event into the attached mediator callbacks', function() {

            var feedback = {
                title: "A title for feedback",
                body: "Body text for feedback"
            }

            Adapt.mediator.default('testing:mediatorFive', function(attributes) {
            });

            Adapt.mediator.on('testing:mediatorFive', function(event, attributes) {
                expect(attributes.body).to.equal("Body text for feedback");
            })

            Adapt.trigger('testing:mediatorFive', feedback);

        });

        it('should allow me to pass attributes from the original event into the attached mediator callbacks & prevent the default callback', function() {

            var mediatorPreventDefault = true;

            var feedback = {
                title: "A title for feedback",
                body: "Body text for feedback"
            }

            Adapt.mediator.default('testing:mediatorSix', function(attributes) {
                mediatorPreventDefault = false;
            });

            Adapt.mediator.on('testing:mediatorSix', function(event, attributes) {
                event.preventDefault();
                expect(attributes.body + " " + mediatorPreventDefault).to.equal("Body text for feedback true");
            })

            Adapt.trigger('testing:mediatorSix', feedback);

        });

        it('should not allow me to overwrite a predefined default callback', function() {

<<<<<<< HEAD
            var mediatorPreventDefault = true;

=======
>>>>>>> b114f5f4aa4cb8c03316e9249a525edc1e5252a1
            Adapt.mediator.default('testing:mediatorSeven', function(attributes) {
                mediatorPreventDefault = false;
            });

<<<<<<< HEAD
            Adapt.mediator.default('testing:mediatorSeven', function(attributes) {
                mediatorPreventDefault = true;
            });

            Adapt.trigger('testing:mediatorSeven');

            expect(mediatorPreventDefault).to.be(false);
=======
            expect(function() {
                Adapt.mediator.default('testing:mediatorSeven', function(attributes) {
                    mediatorPreventDefault = true;
                });
            }).to.throwError();
>>>>>>> b114f5f4aa4cb8c03316e9249a525edc1e5252a1

        });

    });

});
