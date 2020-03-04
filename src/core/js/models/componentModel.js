define([
  'core/js/models/adaptModel'
], function (AdaptModel) {

  class ComponentModel extends AdaptModel {

    constructor(...args) {
      super(...args);
      this._parent = 'blocks';
      this._siblings = 'components';
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
