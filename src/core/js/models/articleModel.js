define([
  'core/js/models/adaptModel'
], function (AdaptModel) {

  class ArticleModel extends AdaptModel {

    constructor(...args) {
      super(...args);
      this._parent = 'contentObjects';
      this._siblings = 'articles';
      this._children = 'blocks';
    }

  }

  return ArticleModel;

});
