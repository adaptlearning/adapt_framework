define([
  'core/js/models/contentObjectModel'
], function (ContentObjectModel) {

  class PageModel extends ContentObjectModel {

    get _children() {
      return 'articles';
    }

  }

  return PageModel;

});
