define([
  'core/js/models/adaptModel'
], function (AdaptModel) {

  class ContentObjectModel extends AdaptModel {

    constructor(...args) {
      super(...args);
      this._parent = 'course';
      this._siblings = 'contentObjects';
      this._children = 'contentObjects';
    }

  }

  return ContentObjectModel;

});
