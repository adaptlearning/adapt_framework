/*
* Notify
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Daryl Hedley <darylhedley@hotmail.com>
*/

define(function(require) {

	var Adapt = require('coreJS/adapt');
	var NotifyView = require('coreViews/notifyView');

	Adapt.on('notify:alert', function(notifyObject) {
		addNotifyView('alert', notifyObject);
	});

	Adapt.on('notify:prompt', function(notifyObject) {
		addNotifyView('prompt', notifyObject);
	});

	Adapt.on('notify:popup', function(notifyObject) {
		addNotifyView('popup', notifyObject);
	});

	function addNotifyView(type, notifyObject) {
		notifyObject._type = type;
		new NotifyView({
			model: new Backbone.Model(notifyObject)
		});
	};

});