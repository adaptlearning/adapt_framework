define([
  'core/js/adapt'
], function (Adapt) {

  var NotifyPushView = Backbone.View.extend({

    className: function () {
      var classes = 'notify-push ';
      classes += (this.model.get('_classes') || '');
      return classes;
    },

    attributes: {
      'role': 'dialog',
      'aria-labelledby': 'notify-push-heading',
      'aria-modal': 'false'
    },

    initialize: function () {
      this.listenTo(Adapt, {
        'notify:pushShown notify:pushRemoved': this.updateIndexPosition,
        'remove': this.remove
      });

      this.listenTo(this.model.collection, {
        'remove': this.updateIndexPosition,
        'change:_index': this.updatePushPosition
      });

      this.preRender();
      this.render();
    },

    events: {
      'click .js-notify-push-close-btn': 'closePush',
      'click .js-notify-push-inner': 'triggerEvent'
    },

    preRender: function () {
      this.hasBeenRemoved = false;
    },

    render: function () {
      var data = this.model.toJSON();
      var template = Handlebars.templates['notifyPush'];
      this.$el.html(template(data)).appendTo('#wrapper');

      _.defer(this.postRender.bind(this));

      return this;
    },

    postRender: function () {
      this.$el.addClass('is-active');

      _.delay(this.closePush.bind(this), this.model.get('_timeout'));

      Adapt.trigger('notify:pushShown');
    },

    closePush: function (event) {
      if (event) {
        event.preventDefault();
      }

      // Check whether this view has been removed as the delay can cause it to be fired twice
      if (this.hasBeenRemoved === false) {

        this.hasBeenRemoved = true;

        this.$el.removeClass('is-active');

        _.delay(function () {
          this.model.collection.remove(this.model);
          Adapt.trigger('notify:pushRemoved', this);
          this.remove();
        }.bind(this), 600);
      }
    },

    triggerEvent: function (event) {
      Adapt.trigger(this.model.get('_callbackEvent'));
      this.closePush();
    },

    updateIndexPosition: function () {
      if (!this.hasBeenRemoved) {
        var models = this.model.collection.models;
        for (var i = 0, len = models.length; i < len; i++) {
          var index = i;
          var model = models[i];
          if (model.get('_isActive') === true) {
            model.set('_index', index);
            this.updatePushPosition();
          }
        }
      }
    },

    updatePushPosition: function () {
      if (this.hasBeenRemoved) {
        return;
      }

      if (typeof this.model.get('_index') !== 'undefined') {
        var elementHeight = this.$el.height();
        var offset = 20;
        var navigationHeight = $('.nav').height();
        var currentIndex = this.model.get('_index');
        var flippedIndex = (currentIndex === 0) ? 1 : 0;

        if (this.model.collection.where({ _isActive: true }).length === 1) {
          flippedIndex = 0;
        }

        var positionLowerPush = (elementHeight + offset) * flippedIndex + navigationHeight + offset;
        this.$el.css('top', positionLowerPush);
      }
    }
  });

  return NotifyPushView;

});
