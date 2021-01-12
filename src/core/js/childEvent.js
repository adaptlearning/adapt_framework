import Adapt from 'core/js/adapt';

/**
 * Event object triggered for controlling child view rendering.
 * Sent with 'view:addChild' and 'view:requestChild' events.
 * All plugins receive the same object reference in their event handler and
 * as such, this object becomes a place of consensus for plugins to decide how
 * to handle rendering for this child.
 */
export default class ChildEvent extends Backbone.Controller {

  /**
   * @param {string} type Event type
   * @param {AdaptView} target Parent view
   * @param {AdaptModel} model Child model
   */
  initialize(type, target, model) {
    /** @type {string} */
    this.type = type;
    /** @type {AdaptView} */
    this.target = target;
    /** @type {boolean} Force the child model to render */
    this.isForced = false;
    /** @type {boolean} Stop rendering before the child model */
    this.isStoppedImmediate = false;
    /** @type {boolean} Stop rendering after the child model */
    this.isStoppedNext = false;
    /** @type {boolean} Contains a model to render in response to a requestChild event */
    this.hasRequestChild = false;
    this._model = model;
  }

  /**
   * Get the model to be rendered.
   * @returns {AdaptModel}
   */
  get model() {
    return this._model;
  }

  /**
   * Set the model to render in response to a 'view:requestChild' event.
   * @param {AdaptModel}
   */
  set model(model) {
    if (this.type !== 'requestChild') {
      Adapt.log.warn(`Cannot change model in ${this.type} event.`);
      return;
    }
    if (this._model) {
      Adapt.log.warn(`Cannot inject two models in one sitting. ${model.get('_id')} attempts to overwrite ${this._model.get('_id')}`);
      return;
    }
    this._model = model;
    this.hasRequestChild = true;
  }

  /**
   * Reset all render stops.
   */
  reset() {
    this.isStoppedImmediate = false;
    this.isStoppedNext = false;
  }

  /**
   * Force model to render.
   */
  force() {
    this.isForced = true;
  }

  /**
   * General stop. Stop immediately or stop next with flag to false.
   * @param {boolean} [immediate=true] Flag to stop immediate or next.
   */
  stop(immediate = true) {
    if (!immediate) {
      return this.stopNext();
    }
    this.isStoppedImmediate = true;
  }

  /**
   * Shortcut to stop(false). Stop the render after the contained model is rendered.
   */
  stopNext() {
    this.isStoppedNext = true;
  }

  /**
   * Trigger an event to signify that a final decision has been reached.
   */
  close() {
    this.trigger('closed');
  }

}
