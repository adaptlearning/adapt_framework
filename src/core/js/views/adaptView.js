import Adapt from 'core/js/adapt';
import { render } from 'core/js/reactHelpers';

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
    this.isReact = (this.constructor.template || '').includes('.jsx');
    if (this.isReact) {
      this.listenTo(this.model, 'all', this.changed);
      // Facilitate adaptive react views
      this.listenTo(Adapt, 'device:changed', this.changed);
    }
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

    if (this.isReact) {
      this.changed();
    } else {
      const data = this.model.toJSON();
      data.view = this;
      const template = Handlebars.templates[this.constructor.template];
      this.$el.html(template(data));
    }

    Adapt.trigger(`${type}View:render view:render`, this);

    _.defer(() => {
      // don't call postRender after remove
      if (this._isRemoved) return;

      this.postRender();
      Adapt.trigger(`${type}View:postRender view:postRender`, this);
    });

    return this;
  }

  /**
   * Re-render a react template
   * @param {string} eventName=null Backbone change event name
   */
  changed(eventName = null) {
    if (!this.isReact) {
      throw new Error('Cannot call changed on a non-react view');
    }
    if (typeof eventName === 'string' && eventName.startsWith('bubble')) {
      // Ignore bubbling events as they are outside of this view's scope
      return;
    }
    const element = render(this.constructor.template.replace('.jsx', ''), this.model, this);
    ReactDOM.render(element, this.el);
  }

  setupOnScreenHandler() {
    const onscreen = this.model.get('_onScreen');

    if (!onscreen || !onscreen._isEnabled) return;

    this.$el.addClass(`has-animation ${onscreen._classes}-before`);
    this.$el.on('onscreen.adaptView', (e, m) => {
      if (!m.onscreen) return;
      const minVerticalInview = onscreen._percentInviewVertical || 33;
      if (m.percentInviewVertical < minVerticalInview) return;
      this.$el.addClass(`${onscreen._classes}-after`).off('onscreen.adaptView');
    });
  }

  addChildren() {
    let nthChild = 0;
    const { models } = this.model.getChildren();
    this.childViews = {};
    models.forEach(model => {
      if (!model.get('_isAvailable')) return;

      nthChild++;
      model.set('_nthChild', nthChild);

      const ChildView = this.constructor.childView || Adapt.getViewClass(model);

      if (!ChildView) {
        throw new Error(`The component '${model.attributes._id}' ('${model.attributes._component}') has not been installed, and so is not available in your project.`);
      }

      const $parentContainer = this.$(this.constructor.childContainer);
      const childView = new ChildView({ model });

      this.childViews[model.get('_id')] = childView;

      $parentContainer.append(childView.$el);
    });
  }

  findDescendantViews(isParentFirst) {
    const descendants = [];
    this.childViews && _.each(this.childViews, view => {
      if (isParentFirst) descendants.push(view);
      const children = view.findDescendantViews && view.findDescendantViews(isParentFirst);
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

    const descendantComponents = this.model.findDescendantModels('components');
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

    Adapt.wait.for(end => {
      if (this.isReact) {
        ReactDOM.unmountComponentAtNode(this.el);
      }
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

  getChildViews() {
    return this.childViews;
  }

}

AdaptView.className = '';

export default AdaptView;

