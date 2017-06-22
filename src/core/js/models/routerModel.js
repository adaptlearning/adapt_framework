define([
    'core/js/adapt'
], function (Adapt) {

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
