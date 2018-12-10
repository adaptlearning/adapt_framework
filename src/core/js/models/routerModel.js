define([
    'core/js/adapt'
], function (Adapt) {

 	var RouterModel = Backbone.Model.extend({

 		defaults: {
 			_canNavigate: true,
			_shouldNavigateFocus: true
 		},

 		lockedAttributes: {
 			_canNavigate: false,
			_shouldNavigateFocus: false
 		}
 		
 	});

 	return RouterModel;

 });
