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
        _isA11yComponentDescriptionEnabled: true,
        _userAnswer: null,
        _attemptStates: null,
      });
    }

    trackable() {
      return AdaptModel.resultExtend('trackable', [
        '_userAnswer',
        '_attemptStates'
      ]);
    }

    trackableType() {
      return AdaptModel.resultExtend('trackableType', [
        Array,
        Array
      ]);
    }

    get hasManagedChildren() {
      return false;
    }

    init() {
      if (Adapt.get('_isStarted')) {
        this.onAdaptInitialize();
        return;
      }
      this.listenToOnce(Adapt, 'adapt:initialize', this.onAdaptInitialize);
    }

    onAdaptInitialize() {
      this.restoreUserAnswers();
    }

    /**
     * Restore the user's answer from the _userAnswer property.
     * The _userAnswer value must be in the form of arrays containing
     * numbers, booleans or arrays only.
     */
    restoreUserAnswers() {}

    /**
     * Store the user's answer in the _userAnswer property.
     * The _userAnswer value must be in the form of arrays containing
     * numbers, booleans or arrays only.
     */
    storeUserAnswer() {}

    resetUserAnswer() {
      this.set('_userAnswer', null);
    }

    reset(type, force) {
      if (!this.get('_canReset') && !force) return;
      this.resetUserAnswer();
      super.reset(type, force);
    }

    /**
     * Returns the current attempt state raw data or the raw data from the supplied attempt state object.
     * @param {Object} [object] JSON object representing the component state. Defaults to current JSON.
     * @returns {Array}
     */
    getAttemptState(object = this.toJSON()) {
      const trackables = this.trackable();
      const types = this.trackableType();
      trackables.find((name, index) => {
        // Exclude _attemptStates as it's trackable but isn't needed here
        if (name !== '_attemptStates') return;
        trackables.splice(index, 1);
        types.splice(index, 1);
        return true;
      });
      const values = trackables.map(n => object[n]);
      const booleans = values.filter((v, i) => types[i] === Boolean).map(Boolean);
      const numbers = values.filter((v, i) => types[i] === Number).map(v => Number(v) || 0);
      const arrays = values.filter((v, i) => types[i] === Array);
      return [
        numbers,
        booleans,
        arrays
      ];
    }

    /**
     * Returns an attempt object representing the current state or a formatted version of the raw state object supplied.
     * @param {Array} [state] JSON object representing the component state, defaults to current state returned from getAttemptState().
     * @returns {Object}
     */
    getAttemptObject(state = this.getAttemptState()) {
      const trackables = this.trackable();
      const types = this.trackableType();
      trackables.find((name, index) => {
        // Exclude _attemptStates as it's trackable but isn't needed here
        if (name !== '_attemptStates') return;
        trackables.splice(index, 1);
        types.splice(index, 1);
        return true;
      });
      const numbers = (state[0] || []).slice(0);
      const booleans = (state[1] || []).slice(0);
      const arrays = (state[2] || []).slice(0);
      const object = {};
      trackables.forEach((n, i) => {
        if (n === '_id') return;
        switch (types[i]) {
          case Number:
            object[n] = numbers.shift();
            break;
          case Boolean:
            object[n] = booleans.shift();
            break;
          case Array:
            object[n] = arrays.shift();
            break;
        }
      });
      return object;
    }

    /**
     * Sets the current attempt state from the supplied attempt state object.
     * @param {Object} object JSON object representing the component state.
     * @param {boolean} silent Stops change events from triggering
     */
    setAttemptObject(object, silent = true) {
      this.set(object, { silent });
    }

    /**
     * Adds the current attempt state object or the supplied state object to the attempts store.
     * @param {Object} [object] JSON object representing the component state. Defaults to current JSON.
     */
    addAttemptObject(object = this.getAttemptObject()) {
      const attemptStates = this.get('_attemptStates') || [];
      const state = this.getAttemptState(object);
      attemptStates.push(state);
      this.set('_attemptStates', attemptStates);
    }

    /**
     * Returns an array of the previous state objects. The most recent state is last in the list.
     * @returns {Array}
     */
    getAttemptObjects() {
      const states = this.get('_attemptStates') || [];
      return states.map(state => this.getAttemptObject(state));
    }

  }

  // This abstract model needs to registered to support deprecated view-only components
  Adapt.register('component', { model: ComponentModel });

  return ComponentModel;

});
