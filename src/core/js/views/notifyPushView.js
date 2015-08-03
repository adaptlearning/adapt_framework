define(function(require) {

	var Backbone = require('backbone');
	var Adapt = require('coreJS/adapt');

	var NotifyPushView = Backbone.View.extend({

		className: 'notify-push',

		initialize: function() {
			this.listenTo(Adapt, 'notify:pushShown notify:pushRemoved', this.updateIndexPosition);
			this.listenTo(this.model.collection, 'remove', this.updateIndexPosition);
			this.listenTo(this.model.collection, 'change:_index', this.updatePushPosition);
			//include accessibility globals in notify model
			this.model.set('_globals', Adapt.course.get('_globals'));
			this.listenTo(Adapt, 'remove', this.remove);
			this.preRender();
			this.render();
		},

		events: {
			'click .notify-push-close': 'closePush',
			'click .notify-push-inner': 'triggerEvent'
		},

		preRender: function() {
			this.hasBeenRemoved = false;
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

			Adapt.trigger('notify:pushShown');

		},

		closePush: function(event) {

			if (event) {
				event.preventDefault();
			}

			// Check whether this view has been removed as the delay can cause it to be fired twice
			if (this.hasBeenRemoved === false) {

				this.hasBeenRemoved = true;

				this.$el.removeClass('show');

				_.delay(_.bind(function() {
					this.model.collection.remove(this.model);
					Adapt.trigger('notify:pushRemoved', this);
					this.remove();
				}, this), 600);

			}

		},

		triggerEvent: function(event) {

			Adapt.trigger(this.model.get('_callbackEvent'));
			this.closePush();

		},

		updateIndexPosition: function() {
			if (!this.hasBeenRemoved) {
				var models = this.model.collection.models;
				for (var i = 0 , len = models.length; i < len; i++) {
					var index = i;
					var model = models[i];
					if (model.get('_isActive') === true) {
						model.set('_index', index);
						this.updatePushPosition();
					}
				}
			}
		},

		updatePushPosition: function() {
			if (this.hasBeenRemoved) {
				return;
			}
			if (this.model.get('_index') != undefined) {
				var elementHeight = this.$el.height();
				var offset = 20;
				var navigationHeight = $('.navigation').height();
				var currentIndex = this.model.get('_index');
				var flippedIndex = (currentIndex == 0) ? 1 : 0;
				if (this.model.collection.where({_isActive:true}).length === 1) {
					flippedIndex = 0;
				}
				var positionLowerPush = (elementHeight + offset) * flippedIndex + navigationHeight + offset;
				this.$el.css('top', positionLowerPush);
			}
		}

	});

	return NotifyPushView;

});
