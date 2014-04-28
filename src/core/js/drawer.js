/*
* Drawer
* License - https://github.com/adaptlearning/adapt_framework/blob/master/LICENSE
* Maintainers - Daryl Hedley <darylhedley@hotmail.com>
*/
define(function(require) {
	
	var DrawerView = require('coreViews/drawerView');
	var DrawerCollection = new Backbone.Collection();
	var Adapt = require('coreJS/adapt');

	var Drawer = {};

	Drawer.addItem = function(drawerObject, eventCallback) {
		drawerObject.eventCallback = eventCallback;
		DrawerCollection.add(drawerObject);
	}

	Drawer.triggerCustomView = function(view) {
		Adapt.trigger('drawer:triggerCustomView', view);
	}

	Drawer.init = function() {
		new DrawerView({collection: DrawerCollection});
	}

	Adapt.once('app:dataReady', function() {
		Drawer.init();
	})

	Adapt.drawer = Drawer;

});