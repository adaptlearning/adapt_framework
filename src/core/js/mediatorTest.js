define(function(require) {

	var Adapt = require('coreJS/adapt');

	var Booming = {};
	Booming.notify = true;

	Adapt.mediator.on('questionView:feedback', function(event) {
		alert('booming');
		if (Booming.notify) {
			event.preventDefault();
		}
	});

	Adapt.trigger('mediator:testOne');

	Booming.notify = false;

	_.delay(function() {
		Adapt.trigger('mediator:testTwo');
	}, 3000);

})

