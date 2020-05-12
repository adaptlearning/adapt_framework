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

    initialize(...args) {
      Adapt.trigger('courseModel:dataLoading');
      super.initialize(...args);
      this.loadedData();
    }

    loadedData() {
      Adapt.course = this;
      Adapt.trigger('courseModel:dataLoaded');
    }

  }

  Adapt.register('course', { model: CourseModel });

  return CourseModel;

});
