define([
  'core/js/adapt',
  'core/js/views/contentObjectView'
], function(Adapt, ContentObjectView) {

  class PageView extends ContentObjectView {

    preRender() {
      // checkIfResetOnRevisit on descendant models before render
      this.model.getAllDescendantModels().forEach(model => {
        if (!model.checkIfResetOnRevisit) return;
        model.checkIfResetOnRevisit();
      });
      super.preRender();
    }

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
