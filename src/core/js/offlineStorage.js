define([
	'core/js/adapt'
], function(Adapt) {

	//Basic API for setting and getting name+value pairs
	//Allows registration of a single handler.

	Adapt.offlineStorage = {

		ready: false,

		initialize: function(handler) {
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
