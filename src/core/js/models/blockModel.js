define([
  'core/js/models/adaptModel'
], function (AdaptModel) {

  var BlockModel = AdaptModel.extend({
    _parent: 'articles',
    _siblings: 'blocks',
    _children: 'components'
  });

  return BlockModel;

});
