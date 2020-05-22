define([
  'core/js/adapt',
  'core/js/views/contentObjectView'
], function(Adapt, ContentObjectView) {

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
    type: 'page',
    template: 'page'
  });

  Adapt.register('page', { view: PageView });

  return PageView;

});
