/**
 * Mediator
 * License - http://github.com/adaptlearning/adapt_framework/LICENSE
 * Maintainers - Daryl Hedley
 */
define(function(require) {

	var Backbone = require('backbone');
	var Adapt = require('coreJS/adapt');

	Adapt.mediator = {};
	var channels = {};
	var events = {};

	Adapt.mediator.default = function(event, callback) {

		if (events[event]) {
			throw new Error('This default event already exists');
		}

		events[event] = event;

		Adapt.on(event, function(attributes) {

			var allowDefaultCallback = true;
			var eventObject = {
				preventDefault: function() {
					allowDefaultCallback = false;
				}
			};
			
			_.each(channels[event], function(channelCallback) {
				channelCallback.apply(null, [eventObject, attributes]);
			});

			if (allowDefaultCallback !== false) {
				callback(attributes);
			}
		});

	};

	Adapt.mediator.on = function(event, callback) {
		if (_.isArray(channels[event])) {
			channels[event].push(callback);
		} else {
			channels[event] = [];
			channels[event].push(callback);
		}
	};

});