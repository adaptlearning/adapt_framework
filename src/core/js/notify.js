/*
* Notify
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Daryl Hedley <darylhedley@hotmail.com>
*/

define(function(require) {

	var Adapt = require('coreJS/adapt');
	var NotifyView = require('coreViews/notifyView');
	var NotifyPushView = require('coreViews/notifyPushView');

	Adapt.on('notify:alert', function(notifyObject) {
		addNotifyView('alert', notifyObject);
	});

	Adapt.on('notify:prompt', function(notifyObject) {
		addNotifyView('prompt', notifyObject);
	});

	Adapt.on('notify:popup', function(notifyObject) {
		addNotifyView('popup', notifyObject);
	});

	Adapt.on('notify:push', function(notifyObject) {
		addNotifyView('push', notifyObject);
	});

	function addNotifyView(type, notifyObject) {
		notifyObject._type = type;

		if (type === 'push') {

			new NotifyPushView({
				model: new Backbone.Model(notifyObject)
			});

			return;

		}

		new NotifyView({
			model: new Backbone.Model(notifyObject)
		});
	};

});