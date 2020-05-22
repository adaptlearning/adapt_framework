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
      return [
        this.constructor.type,
        'contentobject',
        this.constructor.className,
        this.model.get('_id'),
        this.model.get('_classes'),
        this.setVisibility(),
        (this.model.get('_isComplete') ? 'is-complete' : ''),
        (this.model.get('_isOptional') ? 'is-optional' : '')
      ].filter(Boolean).join(' ');
    }

    preRender() {
      $.inview.lock(this.constructor.type + 'View');
      this.disableAnimation = Adapt.config.has('_disableAnimation') ? Adapt.config.get('_disableAnimation') : false;
      this.$el.css('opacity', 0);
      this.listenTo(this.model, 'change:_isReady', this.isReady);
    }

    render() {
      const type = this.constructor.type;
      Adapt.trigger(`${type}View:preRender contentObjectView:preRender view:preRender`, this);

      const data = this.model.toJSON();
      data.view = this;
      const template = Handlebars.templates[this.constructor.template];
      this.$el.html(template(data));

      Adapt.trigger(`${type}View:render contentObjectView:render view:render`, this);

      _.defer(() => {
        // don't call postRender after remove
        if (this._isRemoved) return;

        this.postRender();
        Adapt.trigger(`${type}View:postRender contentObjectView:postRender view:postRender`, this);
      });

      return this;
    }

    async isReady() {
      if (!this.model.get('_isReady') || this._isTriggeredReady) return;
      this._isTriggeredReady = true;

      const type = this.constructor.type;
      const performIsReady = async () => {
        Adapt.trigger(`${type}View:preReady contentObjectView:preReady view:preReady`, this);
        await Adapt.wait.queue();
        $('.js-loading').hide();
        if (Adapt.get('_shouldContentObjectScrollTop') !== false) {
          $(window).scrollTop(0);
        }
        Adapt.trigger(`${type}View:ready contentObjectView:ready view:ready`, this);
        $.inview.unlock(`${type}View`);
        const styleOptions = { opacity: 1 };
        if (this.disableAnimation) {
          this.$el.css(styleOptions);
          $.inview();
          _.defer(() => {
            Adapt.trigger(`${type}View:postReady contentObjectView:postReady view:postReady`, this);
          });
        } else {
          this.$el.velocity(styleOptions, {
            duration: 'fast',
            complete: () => {
              $.inview();
              Adapt.trigger(`${type}View:postReady contentObjectView:postReady view:postReady`, this);
            }
          });
        }
        $(window).scroll();
      };

      _.defer(performIsReady);
    }

    /**
     * Force render up to specified id. Resolves when views are ready.
     * @param {string} id
     */
    async renderTo(id) {
      let models = this.model.getAllDescendantModels(true).filter(model => model.get('_isAvailable'));
      const index = models.findIndex(model => model.get('_id') === id);
      if (index === -1) {
        throw new Error(`Cannot renderTo "${id}" as it isn't a descendant.`);
      }
      // Return early if the model is already rendered and ready
      const model = models[index];
      if (model.get('_isRendered') && model.get('_isReady')) {
        return;
      }
      // Force all models up until the id to render
      models = models.slice(0, index + 1);
      const ids = _.indexBy(models, (model) => model.get('_id'));
      const forceUntilId = (event) => {
        const addingId = event.model.get('_id');
        if (!ids[addingId]) return;
        event.force();
        if (addingId !== id) return;
        Adapt.off('view:addChild', forceUntilId);
      };
      Adapt.on('view:addChild', forceUntilId);
      // Trigger addChildren cascade
      await this.addChildren();
      await this.whenReady();
      // Error if model isn't rendered and ready
      if (!model.get('_isRendered') || !model.get('_isReady')) {
        throw new Error(`Cannot renderTo "${id}".`);
      }
    }

    preRemove() {
      const type = this.constructor.type;
      Adapt.trigger(`${type}View:preRemove contentObjectView:preRemove view:preRemove`, this);
    }

    remove() {
      const type = this.constructor.type;
      this.preRemove();
      Adapt.trigger(`${type}View:remove contentObjectView:remove view:remove`, this);
      this._isRemoved = true;

      Adapt.wait.for(end => {
        this.$el.off('onscreen.adaptView');
        this.findDescendantViews().reverse().forEach(view => {
          view.remove();
        });
        this.setChildViews(null);
        super.remove();
        _.defer(() => {
          Adapt.trigger(`${type}View:postRemove contentObjectView:postRemove view:postRemove`, this);
          this.trigger('postRemove');
        });
        end();
      });

      return this;
    }

    destroy() {
      this.remove();
      if (Adapt.parentView === this) {
        Adapt.parentView = null;
      }
    }

  }

  return ContentObjectView;

});
