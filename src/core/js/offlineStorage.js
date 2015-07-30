define([
	'coreJS/adapt'
], function(Adapt) {

	//Basic API for setting and getting name+value pairs
	//Allows registration of a single handler.

	Adapt.offlineStorage = {

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
		}

	};

	return Adapt.offlineStorage;

});
