define([
  'core/js/adapt',
  'core/js/views/adaptView'
], function(Adapt, AdaptView) {

  class ContentObjectView extends AdaptView {

    attributes() {
      return AdaptView.resultExtend('attributes', {
        'role': 'main',
        'aria-labelledby': `${this.model.get('_id')}-heading`
      }, this);
    }

    className() {
      return _.filter([
        this.constructor.type,
        'contentobject',
        this.constructor.className,
        this.model.get('_id'),
        this.model.get('_classes'),
        this.setVisibility(),
        (this.model.get('_isComplete') ? 'is-complete' : ''),
        (this.model.get('_isOptional') ? 'is-optional' : '')
      ], Boolean).join(' ');
    }

    preRender() {
      $.inview.lock(this.constructor.type + 'View');
      this.disableAnimation = Adapt.config.has('_disableAnimation') ? Adapt.config.get('_disableAnimation') : false;
      this.$el.css('opacity', 0);
      this.listenTo(this.model, 'change:_isReady', this.isReady);
    }

    render() {
      const type = this.constructor.type;
      Adapt.trigger(`${type}View:preRender`, this);

      const data = this.model.toJSON();
      data.view = this;
      const template = Handlebars.templates[this.constructor.template];
      this.$el.html(template(data));

      Adapt.trigger(`${type}View:render`, this);

      _.defer(() => {
        // don't call postRender after remove
        if (this._isRemoved) return;

        this.postRender();
        Adapt.trigger(`${type}View:postRender`, this);
      });

      return this;
    }

    isReady() {
      if (!this.model.get('_isReady')) return;

      const performIsReady = () => {
        $('.js-loading').hide();
        $(window).scrollTop(0);
        const type = this.constructor.type;
        Adapt.trigger(`${type}View:ready`, this);
        $.inview.unlock(`${type}View`);
        const styleOptions = { opacity: 1 };
        if (this.disableAnimation) {
          this.$el.css(styleOptions);
          $.inview();
        } else {
          this.$el.velocity(styleOptions, {
            duration: 'fast',
            complete: () => {
              $.inview();
            }
          });
        }
        $(window).scroll();
      };

      Adapt.wait.queue(() => {
        _.defer(performIsReady);
      });
    }

    preRemove() {
      Adapt.trigger(`${this.constructor.type}View:preRemove`, this);
    }

    remove() {
      const type = this.constructor.type;
      this.preRemove();
      Adapt.trigger(`${type}View:remove`, this);
      this._isRemoved = true;

      Adapt.wait.for(end => {

        this.$el.off('onscreen.adaptView');
        this.model.setOnChildren('_isReady', false);
        this.model.set('_isReady', false);
        super.remove();

        Adapt.trigger(`${type}View:postRemove`, this);

        end();
      });

      return this;
    }

    destroy() {
      this.findDescendantViews().reverse().forEach(view => {
        view.remove();
      });
      this.childViews = [];
      this.remove();
      if (Adapt.parentView === this) {
        Adapt.parentView = null;
      }
    }

  }

  return ContentObjectView;

});
