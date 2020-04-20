define([
  'core/js/adapt',
  'core/js/models/adaptModel'
], function (Adapt, AdaptModel) {

  class ArticleModel extends AdaptModel {

    get _parent() {
      Adapt.log.deprecated('articleModel._parent, use articleModel.getParent() instead, parent models are defined by the JSON');
      return 'contentObjects';
    }

    get _siblings() {
      Adapt.log.deprecated('articleModel._siblings, use articleModel.getSiblings() instead, sibling models are defined by the JSON');
      return 'articles';
    }

    get _children() {
      Adapt.log.deprecated('articleModel._children, use articleModel.hasManagedChildren instead, child models are defined by the JSON');
      return 'blocks';
    }

    /**
     * Returns a string of the model type group.
     * @returns {string}
     */
    getTypeGroup() {
      return 'article';
    }

  }

  Adapt.register('article', { model: ArticleModel });

  return ArticleModel;

});
