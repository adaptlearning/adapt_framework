define([
  'core/js/adapt',
  'core/js/views/contentObjectView',
  'core/js/views/articleView'
], function(Adapt, ContentObjectView, ArticleView) {

  class PageView extends ContentObjectView {

    remove() {
      if (this.$pageLabel) {
        this.$pageLabel.remove();
      }
      super.remove();
    }

  }

  Object.assign(PageView, {
    childContainer: '.article__container',
    childView: ArticleView,
    type: 'page',
    template: 'page'
  });

  return PageView;

});
