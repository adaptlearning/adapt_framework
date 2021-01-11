import Adapt from 'core/js/adapt';

export default class NotifyPushView extends Backbone.View {

  className() {
    let classes = 'notify-push ';
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
    const data = this.model.toJSON();
    const template = Handlebars.templates['notifyPush'];
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

      _.delay(() => {
        this.model.collection.remove(this.model);
        Adapt.trigger('notify:pushRemoved', this);
        this.remove();
      }, 600);
    }
  }

  triggerEvent(event) {
    Adapt.trigger(this.model.get('_callbackEvent'));
    this.closePush();
  }

  updateIndexPosition() {
    if (this.hasBeenRemoved) return;
    const models = this.model.collection.models;
    models.forEach((model, index) => {
      if (!model.get('_isActive')) return;
      model.set('_index', index);
      this.updatePushPosition();
    });
  }

  updatePushPosition() {
    if (this.hasBeenRemoved) {
      return;
    }

    if (typeof this.model.get('_index') !== 'undefined') {
      const elementHeight = this.$el.height();
      const offset = 20;
      const navigationHeight = $('.nav').height();
      const currentIndex = this.model.get('_index');
      let flippedIndex = (currentIndex === 0) ? 1 : 0;

      if (this.model.collection.where({ _isActive: true }).length === 1) {
        flippedIndex = 0;
      }

      const positionLowerPush = (elementHeight + offset) * flippedIndex + navigationHeight + offset;
      this.$el.css('top', positionLowerPush);
    }
  }
}
