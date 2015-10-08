 define(function(require) {

 	var Backbone = require('backbone');
 	var Adapt = require('coreJS/adapt');

 	var RouterModel = Backbone.Model.extend({

 		defaults: {
 			_canNavigate: true
 		},

 		lockedAttributes: {
 			_canNavigate: false
 		}
 		
 	});

 	return RouterModel;

 });
