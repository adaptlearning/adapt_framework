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
			this.listenTo(Adapt, 'drawer:triggerCustomView', this.openCustomView);
			this.listenToOnce(Adapt, 'adapt:initialize', this.checkIfDrawerIsAvailable);
			this.listenTo(Adapt, 'drawer:closeDrawer', this.onCloseDrawer);
			this.listenTo(Adapt, 'remove', this.onCloseDrawer);
			this.render();
		},

		events: {
			'click .drawer-close':'onCloseDrawer'
		},

		render: function() {
			var template = Handlebars.templates['drawer']
            $(this.el).html(template).appendTo('body');
            return this;
		},

		openCustomView: function(view) {
			this._isCustomViewVisible = true;
			Adapt.trigger('drawer:empty');
			this.showDrawer();
			this.$('.drawer-holder').html(view);
			
		},

		checkIfDrawerIsAvailable: function() {
			if(this.collection.length == 0) {
				$('.navigation-drawer-toggle-button').addClass('display-none');
			}
		},

		onCloseDrawer: function(event) {
			if (event) {
				event.preventDefault();
			}
			this._isVisible = false;
			this.hideDrawer();
		},

		toggleDrawer: function() {
			if (this._isVisible && this._isCustomViewVisible === false) {
				this._isVisible = false;
				this.hideDrawer();
			} else {
				this._isVisible = true;
				this.showDrawer(true);
			}
		},

		showDrawer: function(emptyDrawer) {
			Adapt.trigger('popup:opened');
			$('html').css('overflow-y', 'visible');
			$('body').css({'position':'relative', 'overflow': 'hidden'}).animate({"left":-this.$el.width()});
			if (!$('html').hasClass('ie8')) {
				$('.navigation').animate({"left": -this.$el.width()});
			}
			this.$el.animate({'right': 0});
			$('#wrapper').animate({opacity:0.5});
			if (emptyDrawer) {
				this._isCustomViewVisible = false;
				this.emptyDrawer();
				this.renderItems();
			}
			_.defer(_.bind(function() {
				this.addBodyEvent();
			}, this));
		},

		emptyDrawer: function() {
			this.$('.drawer-holder').empty();
		},

		renderItems: function() {
			Adapt.trigger('drawer:empty');
			this.emptyDrawer();
			this.collection.each(function(item) {
				new DrawerItemView({model: item});
			});
		},

		hideDrawer: function() {
			Adapt.trigger('popup:closed');
			$('html').css('overflow-y', 'scroll');
			
			if ($('html').hasClass('ie8')) {
				$('body').css({"left":0});
				$(this).css({'position':'static', 'overflow': 'visible'});
				this.$el.css({'right': -this.$el.width()});
			} else {
				$('body').animate({"left":0}, function() {
					$(this).css({'position':'static', 'overflow': 'visible'});
				});
				$('.navigation').animate({"left": 0});
				this.$el.animate({'right': -this.$el.width()});
			}
			$('#wrapper').animate({opacity:1});
			this._isCustomViewVisible = false;
			this.removeBodyEvent();
		},

		addBodyEvent: function() {
			$('.page, .menu').one('click', _.bind(function() {
				this.onCloseDrawer();
			}, this));
		},

		removeBodyEvent: function() {
			$('.page, .menu').off('click');
		}

	});

	var DrawerItemView = Backbone.View.extend({

		className: 'drawer-item',

		initialize: function() {
			this.listenTo(Adapt, 'drawer:empty', this.remove);
			this.render();
		},

		events: {
			'click .drawer-item-open': 'onDrawerItemClicked'
		},

		render: function() {
			var data = this.model.toJSON();
			var template = Handlebars.templates['drawerItem']
            $(this.el).html(template(data)).appendTo('.drawer-holder');
            return this;
		},

		onDrawerItemClicked: function(event) {
			event.preventDefault();
			var eventCallback = this.model.get('eventCallback');
			Adapt.trigger(eventCallback);
		}

	});

	return DrawerView;

});