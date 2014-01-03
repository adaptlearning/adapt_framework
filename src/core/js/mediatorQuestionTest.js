define(function(require) {

	var Adapt = require('coreJS/adapt');

	Adapt.mediator.default('questionView:feedback', function(attributes) {
		alert('callback called');
		console.log(attributes)
	});

	var feedback = {title:'feedback title', body: 'Feedback body'};

	Adapt.on('mediator:testOne', function() {
		Adapt.trigger('questionView:feedback', {feedback:feedback});
	})
	
	Adapt.on('mediator:testTwo', function() {
		Adapt.trigger('questionView:feedback', {feedback:feedback});
	})

})

