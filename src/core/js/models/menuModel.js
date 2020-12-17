import Adapt from 'core/js/adapt';
import ContentObjectModel from 'core/js/models/contentObjectModel';

class MenuModel extends ContentObjectModel {

  get _children() {
    Adapt.log.deprecated('menuModel._children, use menuModel.hasManagedChildren instead, child models are defined by the JSON');
    return 'contentObjects';
  }

  /**
   * Returns a string of the model type group.
   * @returns {string}
   */
  getTypeGroup() {
    return 'menu';
  }

  setCustomLocking() {
    const children = this.getAvailableChildModels();
    children.forEach(child => {
      child.set('_isLocked', this.shouldLock(child));
      if (!(child instanceof MenuModel)) return;
      child.checkLocking();
    });
  }

}

Adapt.register('menu', { model: MenuModel });

export default MenuModel;
