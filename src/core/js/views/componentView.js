import Adapt from 'core/js/adapt';
import AdaptView from 'core/js/views/adaptView';

class ComponentView extends AdaptView {

  attributes() {
    if (!this.model.get('_isA11yRegionEnabled')) {
      return AdaptView.resultExtend('attributes', {}, this);
    }
    return AdaptView.resultExtend('attributes', {
      'aria-labelledby': this.model.get('_id') + '-heading',
      'role': 'region'
    }, this);
  }

  className() {
    return [
      'component',
      this.model.get('_component').toLowerCase(),
      this.model.get('_id'),
      this.model.get('_classes'),
      this.setVisibility(),
      this.setHidden(),
      'is-' + this.model.get('_layout'),
      (this.model.get('_isComplete') ? 'is-complete' : ''),
      (this.model.get('_isOptional') ? 'is-optional' : '')
    ].join(' ');
  }

  renderState() {
    Adapt.log.removed('renderState is removed and moved to item title');
  }

  /**
   * Allows components that want to use inview for completion to set that up
   * @param {string} [inviewElementSelector] Allows to you to specify (via a selector) which DOM element to use for inview.
   * Defaults to `'.component__inner'` if not supplied.
   * @param {function} [callback] Allows you to specify what function is called when the component has been viewed, should
   * you want to perform additional checks before setting the component to completed - see adapt-contrib-assessmentResults
   * for an example. Defaults to `view.setCompletionStatus` if not specified.
   */
  setupInviewCompletion(inviewElementSelector = '.component__inner', callback = this.setCompletionStatus) {
    this.$inviewElement = this.$(inviewElementSelector);
    this.inviewCallback = callback;

    this.$inviewElement.on('inview.componentView', this.onInview.bind(this));
  }

  removeInviewListener() {
    if (!this.$inviewElement) return;
    this.$inviewElement.off('inview.componentView');
    this.$inviewElement = null;
  }

  onInview(event, visible, visiblePartX, visiblePartY) {
    if (!visible) return;

    switch (visiblePartY) {
      case 'top':
        this.hasSeenTop = true;
        break;
      case 'bottom':
        this.hasSeenBottom = true;
        break;
      case 'both':
        this.hasSeenTop = this.hasSeenBottom = true;
    }

    if (!this.hasSeenTop || !this.hasSeenBottom) return;

    this.inviewCallback();

    if (this.model.get('_isComplete')) {
      this.removeInviewListener();
    }
  }

  postRender() {}

  remove() {
    this.removeInviewListener();
    super.remove();
  }

}

ComponentView.type = 'component';

export default ComponentView;
