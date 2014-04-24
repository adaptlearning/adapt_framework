/*
* Notify Push
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Daryl Hedley <darylhedley@hotmail.com>
*/
define(function(require) {

	var Backbone = require('backbone');
	var Adapt = require('coreJS/adapt');

	var NotifyPushView = Backbone.View.extend({

		className: 'notify-push',

		initialize: function() {
			this.listenTo(Adapt, 'remove', this.remove);
			this.preRender();
			this.render();
		},

		events: {
			'click .notify-push-close': 'closePush',
			'click .notify-push-inner':'triggerEvent'
		},

		preRender: function() {

		},

		render: function() {
          
            var data = this.model.toJSON();
            var template = Handlebars.templates['notifyPush'];
            this.$el.html(template(data)).appendTo('#wrapper');
            
            _.defer(_.bind(function() {
                this.postRender();
            }, this));

            return this;
		},

		postRender: function() {
			this.$el.addClass('show');
			_.delay(_.bind(function() {
				this.closePush();
			}, this), this.model.get('_timeout'));
		},

		closePush: function(event) {
			if (event) {
				event.preventDefault();
			}
			this.$el.removeClass('show');
			_.delay(_.bind(function() {
				this.remove();
			}, this), 600);
		},

		triggerEvent: function(event) {
			Adapt.trigger(this.model.get('_callbackEvent'));
			this.closePush();
		}

	});

	return NotifyPushView;

});