define([
  'core/js/models/contentObjectModel'
], function (ContentObjectModel) {

  class MenuModel extends ContentObjectModel {

    get _children() {
      return 'contentObjects';
    }

  }

  return MenuModel;

});
