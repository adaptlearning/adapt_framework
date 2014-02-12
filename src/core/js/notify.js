/*
* Notify
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Daryl Hedley <darylhedley@hotmail.com>
*/

define(function(require) {

	var Adapt = require('coreJS/adapt');
	var NotifyView = require('coreViews/notifyView');
	var Notify = {};

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
	}

	var alert = {
		title:"ALERT",
		body: "Ooops looks like you've done something wrong!",
		confirmText: "Ok",
		_callbackEvent: 'alert:closed',
		_showIcon: true
	};

	var prompt = {
		title: "PROMPT",
		body: "Would you really like to commit all your spare time to an awesome open source project? Would you really like to commit all your spare time to an awesome open source project?",
		_prompts:[
			{
				promptText: "Yes",
				_callbackEvent: "prompt:yes"
			},
			{
				promptText: "No",
				_callbackEvent: "prompt:no"
			}
		],
		_showIcon: true
	};

	var popup = {
		title: "POPUP",
		body: "Oh - you fancied popping a popup eh?"
	};

	Adapt.on('pageView:ready', function(pageView) {
		if (pageView.model.get('_id') === 'co-05') {
			Adapt.trigger('notify:alert', alert);
		}
		if (pageView.model.get('_id') === 'co-12') {
			Adapt.trigger('notify:prompt', prompt);
		}
		if (pageView.model.get('_id') === 'co-15') {
			Adapt.trigger('notify:popup', popup);
		}
	});

	Adapt.on('alert:closed', function() {
		console.log('alert is closed');
	});
	Adapt.on('prompt:yes', function() {
		console.log('prompt yes');
	});
	Adapt.on('prompt:no', function() {
		console.log('prompt no');
	});
	Adapt.on('notify:closed', function() {
		console.log('notify has closed from a popup');
	});

});