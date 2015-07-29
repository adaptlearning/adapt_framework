// License - http://github.com/adaptlearning/adapt_framework/LICENSE
define(function(require) {

	var Backbone = require('backbone');

    var NotifyModel = Backbone.Model.extend({
        defaults: {
        	_isActive:false,
        	_showIcon:false,
        	_timeout:3000
        }
    });
    
    return NotifyModel;

});