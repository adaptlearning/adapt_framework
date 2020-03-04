define([
  'core/js/models/adaptModel'
], function (AdaptModel) {

  class BlockModel extends AdaptModel {

    get _parent() {
      return 'articles';
    }

    get _siblings() {
      return 'blocks'
    }

    get _children() {
      return 'components';
    }

    defaults() {
      return AdaptModel.resultExtend('defaults', {
        _sortComponents: true
      });
    }
  }

  return BlockModel;

});
