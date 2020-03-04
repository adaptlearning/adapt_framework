define([
  'core/js/models/adaptModel'
], function (AdaptModel) {

  class BlockModel extends AdaptModel {

    constructor(...args) {
      super(...args);
      this._parent = 'articles';
      this._siblings = 'blocks';
      this._children = 'components';
    }

    defaults() {
      return AdaptModel.resultExtend('defaults', {
        _sortComponents: true
      });
    }
  }

  return BlockModel;

});
