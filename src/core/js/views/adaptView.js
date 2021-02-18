import Adapt from 'core/js/adapt';
import ChildEvent from 'core/js/childEvent';

class AdaptView extends Backbone.View {

  attributes() {
    return {
      'data-adapt-id': this.model.get('_id')
    };
  }

  initialize() {
    this.listenTo(this.model, {
      'change:_isVisible': this.toggleVisibility,
      'change:_isHidden': this.toggleHidden,
      'change:_isComplete': this.onIsCompleteChange
    });
    this.model.set({
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
  }

  preRender() {}

  postRender() {
    this.addChildren();
  }

  render() {
    const type = this.constructor.type;
    Adapt.trigger(`${type}View:preRender view:preRender`, this);

    const data = this.model.toJSON();
    data.view = this;
    const template = Handlebars.templates[this.constructor.template];
    this.$el.html(template(data));

    Adapt.trigger(`${type}View:render view:render`, this);

    _.defer(() => {
      // don't call postRender after remove
      if (this._isRemoved) return;

      this.postRender();
      Adapt.trigger(`${type}View:postRender view:postRender`, this);
    });

    return this;
  }

  setupOnScreenHandler() {
    const onscreen = this.model.get('_onScreen');

    if (!onscreen?._isEnabled) return;

    this.$el.addClass(`has-animation ${onscreen._classes}-before`);
    this.$el.on('onscreen.adaptView', (e, m) => {
      if (!m.onscreen) return;
      const minVerticalInview = onscreen._percentInviewVertical || 33;
      if (m.percentInviewVertical < minVerticalInview) return;
      this.$el.addClass(`${onscreen._classes}-after`).off('onscreen.adaptView');
    });
  }

  /**
   * Add children and descendant views, first-child-first. Wait until all possible
   * views are added before resolving asynchronously.
   * Will trigger 'view:addChild'(ChildEvent), 'view:requestChild'(ChildEvent)
   * and 'view:childAdded'(ParentView, ChildView) accordingly.
   * @returns {number} Count of views added
   */
  async addChildren() {
    this.nthChild = this.nthChild || 0;
    // Check descendants first
    let addedCount = await this.addDescendants(false);
    // Iterate through existing available children and/or request new children
    // if required and allowed
    while (true) {
      const models = this.model.getAvailableChildModels();
      const event = this._getAddChildEvent(models[this.nthChild]);
      if (!event) {
        break;
      }
      if (event.isForced) {
        event.reset();
      }
      if (event.isStoppedImmediate || !event.model) {
        // If addChild has been stopped before it is added then
        // set all subsequent models and their children as not rendered
        const subsequentModels = models.slice(this.nthChild);
        subsequentModels.forEach(model => model.setOnChildren('_isRendered', false));
        break;
      }
      // Set model state
      const model = event.model;
      model.set({
        '_isRendered': true,
        '_nthChild': ++this.nthChild
      });
      // Create child view
      const ChildView = this.constructor.childView || Adapt.getViewClass(model);
      if (!ChildView) {
        throw new Error(`The component '${model.attributes._id}' ('${model.attributes._component}') has not been installed, and so is not available in your project.`);
      }
      const childView = new ChildView({ model });
      this.addChildView(childView);
      addedCount++;
      if (event.isStoppedNext) {
        break;
      }
    }

    if (!addedCount) {
      return addedCount;
    }

    // Children were added, unset _isReady
    this.model.set('_isReady', false);
    return addedCount;
  }

  /**
   * Child views can be added with '_renderPosition': 'outer-append' or
   * 'inner-append' (default). Each child view will trigger a
   * 'view:childAdded'(ParentView, ChildView) event and be added to the
   * this.getChildViews() array on this parent.
   * @param {AdaptView} childView
   * @returns {AdaptView} Returns this childView
   */
  addChildView(childView) {
    const childViews = this.getChildViews() || [];
    childViews.push(childView);
    this.setChildViews(childViews);
    const $parentContainer = this.$(this.constructor.childContainer);
    switch (childView.model.get('_renderPosition')) {
      case 'outer-append':
        // Useful for trickle buttons, inline feedback etc
        this.$el.append(childView.$el);
        break;
      case 'inner-append':
      default:
        $parentContainer.append(childView.$el);
        break;
    }
    // Signify that a child has been added to the view to enable updates to status bars
    Adapt.trigger('view:childAdded', this, childView);
    return childView;
  }

  /**
   * Iterates through existing childViews and runs addChildren on them, resolving
   * the total count of views added asynchronously.
   * @returns {number} Count of views added
   */
  async addDescendants() {
    let addedDescendantCount = 0;
    const childViews = this.getChildViews();
    if (!childViews) {
      return addedDescendantCount;
    }
    for (let i = 0, l = childViews.length; i < l; i++) {
      const view = childViews[i];
      addedDescendantCount = view.addChildren ? await view.addChildren() : 0;
      if (addedDescendantCount) {
        break;
      }
    }
    if (!addedDescendantCount) {
      this.model.checkReadyStatus();
      return addedDescendantCount;
    }
    // Descendants were added, unset _isReady
    this.model.set('_isReady', false);
    return addedDescendantCount;
  }

  /**
   * Resolves after outstanding asynchronous view additions are finished
   * and ready.
   */
  async whenReady() {
    if (this.model.get('_isReady')) return;
    return new Promise(resolve => {
      const onReadyChange = (model, value) => {
        if (!value) return;
        this.stopListening(this.model, 'change:_isReady', onReadyChange);
        resolve();
      };
      this.listenTo(this.model, 'change:_isReady', onReadyChange);
      this.model.checkReadyStatus();
    });
  }

  /**
   * Triggers and returns a new ChildEvent object for render control.
   * This function is used by addChildren to manage event triggering.
   * @param {AdaptModel} model
   * @returns {ChildEvent}
   */
  _getAddChildEvent(model) {
    const isRequestChild = (!model);
    let event = new ChildEvent(null, this, model);
    if (isRequestChild) {
      // No model has been supplied, we are at the end of the available child list
      const canRequestChild = this.model.get('_canRequestChild');
      if (!canRequestChild) {
        // This model cannot request children
        return;
      }
      event.type = 'requestChild';
      // Send a request asking for a new model
      Adapt.trigger('view:requestChild', event);
      if (!event.hasRequestChild) {
        // No new model was supplied
        // Close the event so that the final state can be scrutinized
        event.close();
        return;
      }
      // A new model has been supplied for the end of the list.
    }
    // Trigger an event to signify that a new model is to be added
    event.type = 'addChild';
    Adapt.trigger('view:addChild', event);
    // Close the event so that the final state can be scrutinized
    event.close();
    return event;
  }

  /**
   * Return an array of all child and descendant views.
   * @param {boolean} [isParentFirst=false] Array returns with parents before children
   * @returns {[AdaptView]}
   */
  findDescendantViews(isParentFirst) {
    const descendants = [];
    const childViews = this.getChildViews();
    childViews?.forEach(view => {
      if (isParentFirst) descendants.push(view);
      const children = view.findDescendantViews?.(isParentFirst);
      if (children) descendants.push(...children);
      if (!isParentFirst) descendants.push(view);
    });
    return descendants;
  }

  setReadyStatus() {
    this.model.set('_isReady', true);
  }

  setCompletionStatus() {
    if (!this.model.get('_isVisible')) return;
    this.model.set({
      _isComplete: true,
      _isInteractionComplete: true
    });
  }

  resetCompletionStatus(type) {
    if (!this.model.get('_canReset')) return;

    const descendantComponents = this.model.findDescendantModels('component');
    if (descendantComponents.length === 0) {
      this.model.reset(type);
    } else {
      descendantComponents.forEach(model => model.reset(type));
    }
  }

  preRemove() {
    const type = this.constructor.type;
    Adapt.trigger(`${type}View:preRemove view:preRemove`, this);
  }

  remove() {
    const type = this.constructor.type;
    this.preRemove();
    Adapt.trigger(`${type}View:remove view:remove`, this);
    this._isRemoved = true;
    this.stopListening();

    Adapt.wait.for(end => {
      this.$el.off('onscreen.adaptView');
      super.remove();
      _.defer(() => {
        Adapt.trigger(`${type}View:postRemove view:postRemove`, this);
      });
      end();
    });

    return this;
  }

  setVisibility() {
    return this.model.get('_isVisible') ? '' : 'u-visibility-hidden';
  }

  toggleVisibility() {
    this.$el.toggleClass('u-visibility-hidden', !this.model.get('_isVisible'));
  }

  setHidden() {
    return this.model.get('_isHidden') ? 'u-display-none' : '';
  }

  toggleHidden() {
    this.$el.toggleClass('u-display-none', this.model.get('_isHidden'));
  }

  onIsCompleteChange(model, isComplete) {
    this.$el.toggleClass('is-complete', isComplete);
  }

  /**
   * @returns {[AdaptViews]}
   */
  getChildViews() {
    return this._childViews;
  }

  /**
   * @param {[AdaptView]} value
   */
  setChildViews(value) {
    this._childViews = value;
  }

  /**
   * Returns an indexed by id list of child views.
   * @deprecated since 0.5.5
   * @returns {{<string, AdaptView}}
   */
  get childViews() {
    Adapt.log.deprecated(`view.childViews use view.getChildViews()`);
    return _.indexBy(this.getChildViews(), view => view.model.get('_id'));
  }

}

AdaptView.className = '';

export default AdaptView;
