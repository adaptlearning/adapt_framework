import Adapt from 'core/js/adapt';

export default class NotifyPushView extends Backbone.View {

  className() {
    var classes = 'notify-push ';
    classes += (this.model.get('_classes') || '');
    return classes;
  }

  attributes() {
    return {
      'role': 'dialog',
      'aria-labelledby': 'notify-push-heading',
      'aria-modal': 'false'
    };
  }

  initialize() {
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
  }

  events() {
    return {
      'click .js-notify-push-close-btn': 'closePush',
      'click .js-notify-push-inner': 'triggerEvent'
    };
  }

  preRender() {
    this.hasBeenRemoved = false;
  }

  render() {
    var data = this.model.toJSON();
    var template = Handlebars.templates['notifyPush'];
    this.$el.html(template(data)).appendTo('#wrapper');

    _.defer(this.postRender.bind(this));

    return this;
  }

  postRender() {
    this.$el.addClass('is-active');

    _.delay(this.closePush.bind(this), this.model.get('_timeout'));

    Adapt.trigger('notify:pushShown');
  }

  closePush(event) {
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
  }

  triggerEvent(event) {
    Adapt.trigger(this.model.get('_callbackEvent'));
    this.closePush();
  }

  updateIndexPosition() {
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
  }

  updatePushPosition() {
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
}
