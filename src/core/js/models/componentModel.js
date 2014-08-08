/*
* Adapt
* License - https://github.com/adaptlearning/adapt_framework/blob/master/LICENSE
* Maintainers - Daryl Hedley <darylhedley@gmail.com>
*/

define(function(require) {

    var Adapt = require('coreJS/adapt');
	var AdaptModel = require('coreModels/adaptModel');

    var ComponentModel = AdaptModel.extend({
    	
        defaults: _.extend({}, AdaptModel.prototype.defaults, {
                _isInteractionsComplete: false
            }
        ),

        init: function() {
    		// Setup _isQuestionType on question components
    		var componentType = this.get('_component');
            if (Adapt.componentStore[componentType]) {
        		if (Adapt.componentStore[componentType]._isQuestionType) {
        			this.set('_isQuestionType', true);
        		}
            }
    	},

        setupChildListeners: function() {
            // override - empty
        }, 

        checkInteractionStatus: function() {
            // override - empty
        },

        _parent:'blocks',
    	_siblings:'components'
    });
    
    return ComponentModel;

});