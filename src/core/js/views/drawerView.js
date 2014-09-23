/*
* Drawer
* License - https://github.com/adaptlearning/adapt_framework/blob/master/LICENSE
* Maintainers - Daryl Hedley <darylhedley@hotmail.com>, Himanshu Rajotia <himanshu.rajotia@credipoint.com>
*/

define(function(require) {

	var Backbone = require('backbone');
	var Adapt = require('coreJS/adapt');

	var DrawerView = Backbone.View.extend({

		className: 'drawer display-none',

		initialize: function() {
			this._isVisible = false;
			this.listenTo(Adapt, 'navigation:toggleDrawer', this.toggleDrawer);
			this.listenTo(Adapt, 'drawer:triggerCustomView', this.openCustomView);
			this.listenToOnce(Adapt, 'adapt:initialize', this.checkIfDrawerIsAvailable);
			this.listenTo(Adapt, 'drawer:closeDrawer', this.onCloseDrawer);
			this.listenTo(Adapt, 'remove', this.onCloseDrawer);
			this.render();
			this.drawerDuration = Adapt.config.get('_drawer')._duration;
			this.drawerDuration = (this.drawerDuration) ? this.drawerDuration : 400;
			// Setup cached selectors
			this.$wrapper = $('#wrapper');
		},

		events: {
			'click .drawer-back': 'onBackButtonClicked',
			'click .drawer-close':'onCloseDrawer'
		},

		render: function() {
			var template = Handlebars.templates['drawer']
            $(this.el).html(template(Adapt.course.get('_accessibility')._ariaLabels)).appendTo('body');
            var shadowTemplate = Handlebars.templates['shadow'];
            $(shadowTemplate()).appendTo('body');
            // Set defer on post render
            _.defer(_.bind(function() {
				this.postRender();
			}, this));
            return this;
		},

		// Set tabindex for select elements
		postRender: function() {
			this.$('a, button, input, select, textarea').attr('tabindex', -1);
		},

		openCustomView: function(view, hasBackButton) {
			// Set whether back button should display
			this._hasBackButton = hasBackButton;
			this._isCustomViewVisible = true;
			Adapt.trigger('drawer:empty');
			this.showDrawer();
			this.$('.drawer-holder').html(view);
			
		},

		checkIfDrawerIsAvailable: function() {
			if(this.collection.length == 0) {
				$('.navigation-drawer-toggle-button').addClass('display-none');
				Adapt.trigger('drawer:noItems');
			}
		},

		onBackButtonClicked: function(event) {
			event.preventDefault();
			this.showDrawer(true);
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
			this.$el.removeClass('display-none');
			Adapt.trigger('popup:opened');
			var drawerWidth = this.$el.width();
			// Sets tab index to 0 for all tabbable elements in Drawer
			this.$('a, button, input, select, textarea').attr('tabindex', 0);

			if (emptyDrawer) {
				this.$('.drawer-back').addClass('display-none');
				this._isCustomViewVisible = false;
				this.emptyDrawer();
				this.renderItems();
				Adapt.trigger('drawer:openedItemView');
				// If list items change focus to close button
				this.$('.drawer-close').focus();
			} else {
				if (this._hasBackButton) {
					this.$('.drawer-back').removeClass('display-none');
					// Change focus to back button
					this.$('.drawer-back').focus();
				} else {
					this.$('.drawer-back').addClass('display-none');
					// Change focus to close button
					this.$('.drawer-close').focus();
				}
				Adapt.trigger('drawer:openedCustomView');
			}
			_.defer(_.bind(function() {
				var showEasingAnimation = Adapt.config.get('_drawer')._showEasing;
				var easing = (showEasingAnimation) ? showEasingAnimation : 'easeOutQuart';
				this.$el.velocity({'right': 0}, this.drawerDuration, easing);
                $('#shadow').removeClass('display-none');
				this.addShadowEvent();
				Adapt.trigger('drawer:opened');

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

			var showEasingAnimation = Adapt.config.get('_drawer')._hideEasing;
			var easing = (showEasingAnimation) ? showEasingAnimation : 'easeOutQuart';

			var duration = Adapt.config.get('_drawer')._duration;
			duration = (duration) ? duration : 400;

			this.$el.velocity({'right': -this.$el.width()}, this.drawerDuration, easing, _.bind(function() {
				this.$el.addClass('display-none');
			}, this));
            $('#shadow').addClass('display-none');
			this._isCustomViewVisible = false;
			this.removeShadowEvent();
			Adapt.trigger('drawer:closed');
		},

        addShadowEvent: function() {
			$('#shadow').one('click touchstart', _.bind(function() {
				this.onCloseDrawer();
			}, this));
		},

        removeShadowEvent: function() {
			$('#shadow').off('click touchstart');
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