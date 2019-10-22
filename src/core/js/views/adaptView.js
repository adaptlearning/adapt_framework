define([
  'core/js/adapt'
], function(Adapt) {

  var AdaptView = Backbone.View.extend({

    attributes: function() {
      return {
        "data-adapt-id": this.model.get('_id')
      };
    },

    initialize: function() {
      this.listenTo(Adapt, 'remove', this.remove);
      this.listenTo(this.model, {
        'change:_isVisible': this.toggleVisibility,
        'change:_isHidden': this.toggleHidden,
        'change:_isComplete': this.onIsCompleteChange
      });
      this.model.set( {
        '_globals': Adapt.course.get('_globals'),
        '_isReady': false
      });
      this._isRemoved = false;

      if (Adapt.location._currentId === this.model.get('_id')) {
        Adapt.parentView = this;
      }

      this.preRender();
      this.render();
      this.setupOnScreenHandler();
    },

    preRender: function() {},

    postRender: function() {
      this.addChildren();
    },

    render: function() {
      Adapt.trigger(this.constructor.type + 'View:preRender', this);

      var data = this.model.toJSON();
      data.view = this;
      var template = Handlebars.templates[this.constructor.template];
      this.$el.html(template(data));

      Adapt.trigger(this.constructor.type + 'View:render', this);

      _.defer(function() {
        // don't call postRender after remove
        if(this._isRemoved) return;

        this.postRender();
        Adapt.trigger(this.constructor.type + 'View:postRender', this);
      }.bind(this));

      return this;
    },

    setupOnScreenHandler: function() {
      var onscreen = this.model.get('_onScreen');

      if (!onscreen || !onscreen._isEnabled) return;

      this.$el
        .addClass('has-animation')
        .addClass(onscreen._classes + '-before');

      this.$el.on('onscreen.adaptView', function (e, m) {

        if (!m.onscreen) return;

        var minVerticalInview = onscreen._percentInviewVertical || 33;

        if (m.percentInviewVertical < minVerticalInview) return;

        this.$el.addClass( onscreen._classes + '-after' || 'onscreen' ).off('onscreen.adaptView');

      }.bind(this));
    },

    addChildren: function() {
      var nthChild = 0;
      var children = this.model.getChildren();
      var models = children.models;
      this.childViews = {};
      for (var i = 0, len = models.length; i < len; i++) {
        var model = models[i];
        if (!model.get('_isAvailable')) continue;

        nthChild ++;
        model.set("_nthChild", nthChild);

        var ViewModelObject = this.constructor.childView || Adapt.componentStore[model.get("_component")];
        var ChildView = ViewModelObject.view || ViewModelObject;

        if (!ChildView) {
          throw 'The component \'' + models[i].attributes._id + '\'' +
          ' (\'' + models[i].attributes._component + '\')' +
          ' has not been installed, and so is not available in your project.';
        }

        var $parentContainer = this.$(this.constructor.childContainer);
        var childView = new ChildView({ model: model });

        this.childViews[model.get('_id')] = childView;

        $parentContainer.append(childView.$el);
      }
    },

    findDescendantViews: function(isParentFirst) {
      var descendants = [];
      this.childViews && _.each(this.childViews, function(view) {
        if (isParentFirst) descendants.push(view);
        var children = view.findDescendantViews && view.findDescendantViews(isParentFirst);
        if (children) descendants.push.apply(descendants, children);
        if (!isParentFirst) descendants.push(view);
      });
      return descendants;
    },

    setReadyStatus: function() {
      this.model.set('_isReady', true);
    },

    setCompletionStatus: function() {
      if (this.model.get('_isVisible')) {
        this.model.set({
          '_isComplete': true,
          '_isInteractionComplete': true
        });
      }
    },

    resetCompletionStatus: function(type) {
      if (!this.model.get("_canReset")) return;

      var descendantComponents = this.model.findDescendantModels('components');
      if (descendantComponents.length === 0) {
        this.model.reset(type);
      } else {
        _.each(descendantComponents, function(model) {
          model.reset(type);
        });
      }
    },

    preRemove: function() {},

    remove: function() {

      this.preRemove();
      this._isRemoved = true;

      Adapt.wait.for(function(end) {

        this.$el.off('onscreen.adaptView');
        this.model.setOnChildren('_isReady', false);
        this.model.set('_isReady', false);
        Backbone.View.prototype.remove.call(this);

        end();
      }.bind(this));

      return this;
    },

    setVisibility: function() {
      var visible = 'u-visibility-hidden';
      if (this.model.get('_isVisible')) {
        visible = '';
      }
      return visible;
    },

    toggleVisibility: function() {
      if (this.model.get('_isVisible')) {
        return this.$el.removeClass('u-visibility-hidden');
      }
      this.$el.addClass('u-visibility-hidden');
    },

    setHidden: function() {
      var hidden = '';
      if (this.model.get('_isHidden')) {
        hidden = 'u-display-none';
      }
      return hidden;
    },

    toggleHidden: function() {
      if (!this.model.get('_isHidden')) {
        return this.$el.removeClass('u-display-none');
      }
      this.$el.addClass('u-display-none');
    },

    onIsCompleteChange: function(model, isComplete){
      this.$el.toggleClass('is-complete', isComplete);
    },

    getChildViews: function() {
      return this.childViews;
    }

  },{
    className: ''
  });

  return AdaptView;

});
