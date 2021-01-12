import AdaptView from 'core/js/views/adaptView';

class MenuItemView extends AdaptView {

  attributes() {
    return AdaptView.resultExtend('attributes', {
      'role': 'listitem',
      'aria-labelledby': this.model.get('_id') + '-heading'
    }, this);
  }

  className() {
    return [
      'menu-item',
      this.constructor.className,
      this.model.get('_id'),
      this.model.get('_classes'),
      this.setVisibility(),
      this.setHidden(),
      (this.model.get('_isVisited') ? 'is-visited' : ''),
      (this.model.get('_isComplete') ? 'is-complete' : ''),
      (this.model.get('_isLocked') ? 'is-locked' : ''),
      (this.model.get('_isOptional') ? 'is-optional' : '')
    ].join(' ');
  }

  preRender() {
    this.model.checkCompletionStatus();
    this.model.checkInteractionCompletionStatus();
  }

  postRender() {
    this.$el.imageready(this.setReadyStatus.bind(this));
  }

}

MenuItemView.type = 'menuItem';

export default MenuItemView;
