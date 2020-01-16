define([
  'core/js/adapt'
], function(Adapt) {

  // Basic API for setting and getting name+value pairs
  // Allows registration of a single handler.

  var OfflineStorage = Backbone.Controller.extend({

    /**
     * set to true initially so that if there are no offlineStorage handlers (i.e. if contrib-spoor is not installed)
     * this can still be accessed OK
     */
    ready: true,
    _handler: undefined,

    /**
     * set .ready to false if an offlineStorage handler is being attached - we'll need to wait until the handler lets us know
     * it's ready before we can safely use offlineStorage
     */
    initialize: function(handler) {
      if (!handler) {
        return;
      }

      this.ready = false;
      this._handler = handler;
    },

    /**
     * Flag to indicate if an offlineStorage handler has been defined.
     * @returns {boolean} true if an offlineStorage handler has been defined, false otherwise
     */
    hasHandler: function() {
      return this._handler !== undefined;
    },

    set: function(name, value) {
      if (this._handler && this._handler.set) {
        return this._handler.set.apply(this._handler, arguments);
      }
      // if no handler has been defined, just store the data locally
      this[name] = value;
    },

    get: function(name) {
      if (this._handler && this._handler.get) {
        return this._handler.get.apply(this._handler, arguments);
      }
      // if no handler has been defined, check local data store
      return this[name];
    },

    /**
     * Some forms of offlineStorage could take time to initialise, this allows us to let plugins know when it's ready to be used
     */
    setReadyStatus: function() {
      this.ready = true;
      Adapt.trigger('offlineStorage:ready');
    }

  });

  Adapt.offlineStorage = new OfflineStorage();

  return Adapt.offlineStorage;

});
