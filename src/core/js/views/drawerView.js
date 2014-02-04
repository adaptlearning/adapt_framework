/*
* Drawer
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Daryl Hedley <darylhedley@hotmail.com>
*/

define(function(require) {

	var Backbone = require('backbone');
	var Adapt = require('coreJS/adapt');

	var DrawerView = Backbone.View.extend({

		className: 'drawer',

		initialize: function() {
			this._isVisible = false;
			this.listenTo(Adapt, 'navigation:toggleDrawer', this.toggleDrawer);
			//this.listenTo(Adapt, 'drawer:show', this.showDrawer);
			this.render();
		},

		render: function() {
			var template = Handlebars.templates['drawer']
            $(this.el).html(template).appendTo('body');
            return this;
		},

		toggleDrawer: function() {
			if (this._isVisible) {
				this._isVisible = false;
				this.hideDrawer();
			} else {
				this._isVisible = true;
				this.showDrawer();
			}
		},

		showDrawer: function() {
			$('html').css('overflow-y', 'visible');
			$('body').css({'position':'relative', 'overflow': 'hidden'}).animate({"left":-320});
			$('.navigation').animate({"left": -320});
			this.$el.animate({'right': 0});
		},

		hideDrawer: function() {
			$('html').css('overflow-y', 'scroll');
			$('body').animate({"left":0}, function() {
				$(this).css({'position':'statis', 'overflow': 'visible'});
			});
			$('.navigation').animate({"left": 0});
			this.$el.animate({'right': -320});
		}

	});

	return DrawerView;

});