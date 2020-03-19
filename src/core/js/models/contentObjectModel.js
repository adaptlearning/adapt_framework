define([
  'core/js/adapt',
  'core/js/models/adaptModel'
], function (Adapt, AdaptModel) {

  class ContentObjectModel extends AdaptModel {

    get _parent() {
      const isParentCourse = (this.get('_parentId') === Adapt.course.get('_id'));
      if (isParentCourse) {
        return 'course';
      }
      return 'contentObjects';
    }

    get _siblings() {
      return 'contentObjects';
    }

    get _children() {
      return null;
    }

  }

  return ContentObjectModel;

});
