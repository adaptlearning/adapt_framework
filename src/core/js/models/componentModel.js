define([
  'core/js/models/adaptModel'
], function (AdaptModel) {

  class ComponentModel extends AdaptModel {

    get _parent() {
      return 'blocks';
    }

    get _siblings() {
      return 'components';
    }

    defaults() {
      return AdaptModel.resultExtend('defaults', {
        _isA11yComponentDescriptionEnabled: true
      });
    }

    trackable() {
      return AdaptModel.resultExtend('trackable', [
        '_userAnswer'
      ]);
    }
  }

  return ComponentModel;

});
