/**
 * Mediator
 * License - http://github.com/adaptlearning/adapt_framework/LICENSE
 * Maintainers - Daryl Hedley
 */
define(function(require) {

	var Backbone = require('backbone');
	var Adapt = require('coreJS/adapt');

	Adapt.mediator = {};
	Adapt.mediator.channels = {};

	Adapt.mediator.default = function(event, callback) {

		Adapt.on(event, function(attributes) {

			var allowDefaultCallback = true;
			var eventObject = {
				preventDefault: function() {
					allowDefaultCallback = false;
				}
			};
			
			_.each(Adapt.mediator.channels[event], function(channelCallback) {
				channelCallback.apply(null, [eventObject, attributes]);
			});

			if (allowDefaultCallback !== false) {
				callback(attributes);
			}
		});

	};

	Adapt.mediator.on = function(event, callback) {
		if (_.isArray(Adapt.mediator.channels[event])) {
			Adapt.mediator.channels[event].push(callback);
		} else {
			Adapt.mediator.channels[event] = [];
			Adapt.mediator.channels[event].push(callback);
		}
	};

});