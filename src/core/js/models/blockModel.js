define([
  'core/js/models/adaptModel'
], function (AdaptModel) {

  var BlockModel = AdaptModel.extend({
    _parent: 'articles',
    _siblings: 'blocks',
    _children: 'components',

    defaults: function() {
      return AdaptModel.resultExtend('defaults', {
        _sortComponents: true
      });
    }

  });

  return BlockModel;

});
