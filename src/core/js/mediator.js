/**
 * Mediator
 * License - https://github.com/adaptlearning/adapt_framework/blob/master/LICENSE
 * Maintainers - Daryl Hedley
 */
define(function(require) {

	var Backbone = require('backbone');
	var Adapt = require('coreJS/adapt');

	Adapt.mediator = {};
	var channels = {};
	var events = {};

	Adapt.mediator.defaultCallback = function(event, callback, context) {

		if (events[event]) {
			return;
		}

		events[event] = callback;

		Adapt.on(event, function(attributes) {

			var allowDefaultCallback = true;
			var eventObject = {
				preventDefault: function() {
					allowDefaultCallback = false;
				}
			};
			
			_.each(channels[event], function(channelCallback) {
				channelCallback.apply(this, [eventObject, attributes]);
			});

			if (allowDefaultCallback !== false) {
				callback.call(context, attributes);
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