/*
* NotifyView
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Daryl Hedley <darylhedley@hotmail.com>
*/

define(function(require) {

	var Adapt = require('coreJS/adapt');

	var NotifyView = Backbone.View.extend({

		className: 'notify',

		initialize: function() {
			this.listenTo(Adapt, 'remove', this.remove);
      		this.listenTo(Adapt, 'device:resize', this.resetNotifySize);
			this.render();
		},

		events: {
			'click .notify-popup-alert-button':'onAlertButtonClicked',
			'click .notify-popup-prompt-button': 'onPromptButtonClicked',
			'click .notify-popup-icon-close': 'onCloseButtonClicked'
		},

		render: function() {
			var data = this.model.toJSON();
            var template = Handlebars.templates['notify'];
            this.$el.html(template(data)).appendTo('body');
            this.showNotify();
            return this;
		},

		onAlertButtonClicked: function(event) {
			event.preventDefault();
			Adapt.trigger(this.model.get('_callbackEvent'), this);
			this.closeNotify();
		},

		onPromptButtonClicked: function(event) {
			event.preventDefault();
			Adapt.trigger($(event.currentTarget).attr('data-event'));
			this.closeNotify();
		},

		onCloseButtonClicked: function(event) {
			event.preventDefault();
			Adapt.trigger('notify:closed');
			this.closeNotify();
		},
		resetNotifySize: function() {
			$('.notify-popup').removeAttr('style');
			this.resizeNotify(true);
		},

		resizeNotify: function(noAnimation) {
			var windowHeight = $(window).height();
			var notifyHeight = this.$('.notify-popup').height();
			var animationSpeed = 400;
			if (notifyHeight > windowHeight) {
				this.$('.notify-popup').css({
					'height':'100%', 
					'top':0, 
					'overflow-y': 'scroll', 
					'-webkit-overflow-scrolling': 'touch'
				});
			} else {
				if (noAnimation) {
					var animationSpeed = 0;
				}
				this.$('.notify-popup').css({
					'margin-top': -(notifyHeight/2)-50, 'opacity': 0
				}).animate({
					'margin-top': -(notifyHeight/2), 'opacity':1
				}, animationSpeed);
			}
		},

		showNotify: function() {
			this.resizeNotify();
			this.$('.notify-popup').show();
			this.$('.notify-shadow').fadeIn('fast');
		},

		closeNotify: function (event) {
			this.$el.fadeOut('fast', _.bind(function() {
				this.remove();
			}, this));
			Adapt.trigger('popup:closed');
		}

	});

	return NotifyView;

});