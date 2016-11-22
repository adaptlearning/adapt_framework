define([
	'core/js/adapt'
], function(Adapt) {

	//Basic API for setting and getting name+value pairs
	//Allows registration of a single handler.

	Adapt.offlineStorage = {

		/**
		 * set to true initially so that if there are no offlineStorage handlers (i.e. if contrib-spoor is not installed)
		 * this can still be accessed OK
		 */
		ready: true,

		/**
		 * set .ready to false if an offlineStorage handler is being attached - we'll need to wait until the handler lets us know
		 * it's ready before we can safely use offlineStorage
		 */
		initialize: function(handler) {
			this.ready = false;
			this._handler = handler;
		},

		set: function(name, value) {
			if (!(this._handler && this._handler.set)) return;
			return this._handler.set.apply(this._handler, arguments);
		},

		get: function(name) {
			if (!(this._handler && this._handler.get)) return;
			return this._handler.get.apply(this._handler, arguments);
		},

		/**
		 * Some forms of offlineStorage could take time to initialise, this allows us to let plugins know when it's ready to be used 
		 */
		setReadyStatus: function() {
			this.ready = true;
			Adapt.trigger("offlineStorage:ready");
		}

	};

	return Adapt.offlineStorage;

});
