// 2017-04-11 https://github.com/cgkineo/backbone.controller
/*
	Adds an extensible class to backbone, which doesn't have a Model or DOM element (.$el) and isn't a Collection,.
	It still works exactly like Model, View and Collection, in that it has the Events API, .extend and an initialize function
*/
define("backbone.controller", [
	"backbone",
	"underscore"
], function(Backbone, _) {

	var Controller = Backbone.Controller = function(options) {
		options || (options = {});
		_.extend(this, _.pick(options, controllerOptions));
		this.initialize.apply(this, arguments);
	};

	var controllerOptions = ['model', 'collection'];

	_.extend(Controller.prototype, Backbone.Events, {

		initialize: function() {}

	});

	Controller.extend = Backbone.View.extend;

	return Backbone;

});