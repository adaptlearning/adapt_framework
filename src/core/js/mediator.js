/**
 * Mediator
 * License - http://github.com/adaptlearning/adapt_framework/LICENSE
 * Maintainers - Daryl Hedley
 */
define(function(require) {

	var Backbone = require('backbone');
	var Adapt = require('coreJS/adapt');

	Adapt.mediator = _.extend({}, Backbone.Events);

	console.log(Adapt.mediator);

});