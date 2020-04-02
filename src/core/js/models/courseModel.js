define([
  'core/js/adapt',
  'core/js/models/menuModel'
], function (Adapt, MenuModel) {

  class CourseModel extends MenuModel {

    get _parent() {
      Adapt.log.deprecated('courseModel._parent, use courseModel.getParent() instead, parent models are defined by the JSON');
      return null;
    }

    get _siblings() {
      Adapt.log.deprecated('courseModel._siblings, use courseModel.getSiblings() instead, sibling models are defined by the JSON');
      return null;
    }

    /**
     * Returns a string of the model type group.
     * @returns {string}
     */
    getTypeGroup() {
      return 'course';
    }

    initialize(attrs, options) {
      super.initialize(arguments);
      Adapt.trigger('courseModel:dataLoading');
      this.url = options.url;
      this.on('sync', this.loadedData, this);
      if (!this.url) return;
      this.fetch({
        error: () => console.error(`ERROR: unable to load file ${this.url}`)
      });
    }

    loadedData() {
      Adapt.trigger('courseModel:dataLoaded');
    }

  }

  return CourseModel;

});
