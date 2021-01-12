import Adapt from 'core/js/adapt';

// Basic API for setting and getting name+value pairs
// Allows registration of a single handler.

class OfflineStorage extends Backbone.Controller {

  /**
   * set .ready to false if an offlineStorage handler is being attached - we'll need to wait until the handler lets us know
   * it's ready before we can safely use offlineStorage
   */
  initialize(handler) {
    /**
     * set to true initially so that if there are no offlineStorage handlers (i.e. if contrib-spoor is not installed)
     * this can still be accessed OK
     */
    this.ready = true;
    this._handler = undefined;

    if (!handler) {
      return;
    }

    this.ready = false;
    this._handler = handler;
  }

  /**
   * Flag to indicate if an offlineStorage handler has been defined.
   * @returns {boolean} true if an offlineStorage handler has been defined, false otherwise
   */
  hasHandler() {
    return this._handler !== undefined;
  }

  /**
   * Causes state to be serialized and saved.
   */
  save() {
    Adapt.trigger('tracking:save');
    if (this._handler && this._handler.save) {
      return this._handler.save.apply(this._handler, arguments);
    }
  }

  /**
   * Serializes nested arrays, booleans and numbers into an encoded string.
   * @param {Array|boolean|number} value
   * @returns {string}
   */
  serialize(value) {
    if (this._handler && this._handler.serialize) {
      return this._handler.serialize.apply(this._handler, arguments);
    }
    return JSON.stringify(value);
  }

  /**
   * Deserializes encoded strings back into nested arrays, booleans and numbers.
   * @param {string} value
   * @returns {Array|boolean|number}
   */
  deserialize(value) {
    if (this._handler && this._handler.deserialize) {
      return this._handler.deserialize.apply(this._handler, arguments);
    }
    return JSON.parse(value);
  }

  set(name, value) {
    if (this._handler && this._handler.set) {
      return this._handler.set.apply(this._handler, arguments);
    }
    // if no handler has been defined, just store the data locally
    this[name] = value;
  }

  get(name) {
    if (this._handler && this._handler.get) {
      return this._handler.get.apply(this._handler, arguments);
    }
    // if no handler has been defined, check local data store
    return this[name];
  }

  /**
   * Some forms of offlineStorage could take time to initialise, this allows us to let plugins know when it's ready to be used
   */
  setReadyStatus() {
    this.ready = true;
    Adapt.trigger('offlineStorage:ready');
  }

}

Adapt.offlineStorage = new OfflineStorage();

export default Adapt.offlineStorage;
