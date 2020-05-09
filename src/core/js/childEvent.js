define(function() {

  class ChildEvent extends Backbone.Controller {

    initialize(type, target, model) {
      this.type = type;
      this.target = target;
      this.isForced = false;
      this.isStoppedImmediate = false;
      this.isStoppedNext = false;
      this.hasRequestChild = false;
      this._model = model;
    }

    get model() {
      return this._model;
    }

    set model(value) {
      if (this.type !== 'requestChild') {
        Adapt.log.warn(`Cannot change model in ${this.type} event.`);
        return;
      }
      if (this._model) {
        Adapt.log.warn(`Cannot inject two models in one sitting. ${model.get('_id')} attempts to overwrite ${this._model.get('_id')}`);
        return;
      }
      this._model = value;
      this.hasRequestChild = true;
    }

    reset() {
      this.isStoppedImmediate = false;
      this.isStoppedNext = false;
    }

    force() {
      this.isForced = true;
    }

    stop(immediate = true) {
      if (!immediate) {
        return this.stopNext();
      }
      this.isStoppedImmediate = true;
    }

    stopNext() {
      this.isStoppedNext = true;
    }

    close() {
      this.trigger('closed');
    }

  }

  return ChildEvent;

});
