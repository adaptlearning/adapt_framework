define([
  'core/js/models/adaptModel'
], function (AdaptModel) {

  var ContentObjectModel = AdaptModel.extend({
    _parent: 'course',
    _siblings: 'contentObjects',
    _children: 'contentObjects'
  });

  return ContentObjectModel;

});
