// License - https://github.com/adaptlearning/adapt_framework/blob/master/LICENSE
 define(function(require) {

 	var Backbone = require('backbone');
 	var Adapt = require('coreJS/adapt');

 	var RouterModel = Backbone.Model.extend({

 		defaults: {
 			_canNavigate: true
 		}
 	});

 	return RouterModel;

 });
