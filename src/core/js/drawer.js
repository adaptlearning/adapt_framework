define(function(require) {

	var DrawerView = require('coreViews/drawerView');
	var DrawerCollection = new Backbone.Collection();
	var Adapt = require('coreJS/adapt');

	var Drawer = {};

	Drawer.addItem = function(drawerObject, eventCallback) {
		drawerObject.eventCallback = eventCallback;
		DrawerCollection.add(drawerObject);
	};

	Drawer.triggerCustomView = function(view, hasBackButton) {
		if (hasBackButton !== false) {
			hasBackButton = true;
		}
		Adapt.trigger('drawer:triggerCustomView', view, hasBackButton);
	};

	var init = function() {
		var drawerView = new DrawerView({collection: DrawerCollection});

		Adapt.on('app:languageChanged', function() {
			drawerView.remove();
			drawerView = new DrawerView({collection: DrawerCollection});
		});
	};

	Adapt.once('app:dataReady', function() {
		init();
	});

	Adapt.drawer = Drawer;

});
