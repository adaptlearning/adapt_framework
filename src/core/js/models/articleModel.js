define([
  'core/js/models/adaptModel'
], function (AdaptModel) {

  class ArticleModel extends AdaptModel {

    get _parent() {
      return 'contentObjects';
    }

    get _siblings() {
      return 'articles'
    }

    get _children() {
      return 'blocks';
    }

  }

  return ArticleModel;

});
