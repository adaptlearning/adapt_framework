define([
  'core/js/adapt',
  'core/js/models/contentObjectModel'
], function (Adapt, ContentObjectModel) {

  class PageModel extends ContentObjectModel {

    get _children() {
      Adapt.log.deprecated('pageModel._children, use menuModel.hasManagedChildren instead, child models are defined by the JSON');
      return 'articles';
    }

    /**
     * Returns a string of the model type group.
     * @returns {string}
     */
    getTypeGroup() {
      return 'page';
    }

  }

  Adapt.register('page', { model: PageModel });

  return PageModel;

});
