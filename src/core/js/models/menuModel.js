define([
  'core/js/models/contentObjectModel'
], function (ContentObjectModel) {

  class MenuModel extends ContentObjectModel {

    get _children() {
      return 'contentObjects';
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

  return MenuModel;

});
