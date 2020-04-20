define([
  'core/js/adapt',
  'core/js/models/adaptModel'
], function (Adapt, AdaptModel) {

  class ComponentModel extends AdaptModel {

    get _parent() {
      Adapt.log.deprecated('componentModel._parent, use componentModel.getParent() instead, parent models are defined by the JSON');
      return 'blocks';
    }

    get _siblings() {
      Adapt.log.deprecated('componentModel._siblings, use componentModel.getSiblings() instead, sibling models are defined by the JSON');
      return 'components';
    }

    /**
     * Returns a string of the model type group.
     * @returns {string}
     */
    getTypeGroup() {
      return 'component';
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

    get hasManagedChildren() {
      return false;
    }

  }

  return ComponentModel;

});
