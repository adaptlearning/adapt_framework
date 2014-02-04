/*
* Page Level Progress
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Daryl Hedley <darylhedley@hotmail.com>
*/
define(function(require) {
	
	var DrawerView = require('coreViews/drawerView');
	var DrawerCollection = new Backbone.Collection();
	var Adapt = require('coreJS/adapt');

	var DrawerItemView = Backbone.View.extend({
		initialize: function() {
			console.log(this);
		}
	});

	var Drawer = {};

	Drawer.addItem = function(drawerObject, eventCallback) {
		drawerObject.eventCallback = eventCallback;
		DrawerCollection.add(drawerObject);
		console.log(DrawerCollection);
	}

	Drawer.show = function() {
		
	}

	Drawer.init = function() {
		new DrawerView({collection: DrawerCollection});
		console.log('drawer init');
	}

	Adapt.once('app:dataReady', function() {
		Drawer.init();
		Drawer.show();
	})

	return Drawer;

});