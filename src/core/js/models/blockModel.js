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

  }

  return BlockModel;

});
