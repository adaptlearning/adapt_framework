/*
* Adapt
* License - https://github.com/adaptlearning/adapt_framework/blob/master/LICENSE
* Maintainers - Daryl Hedley <darylhedley@gmail.com>
*/

define(function(require) {

	var AdaptModel = require('coreModels/adaptModel');

    var ComponentModel = AdaptModel.extend({
    	init: function() {
    		// Setup _isQuestionType on question components
    		var componentType = this.get('_component');
    		if (Adapt.componentStore[componentType]._isQuestionType) {
    			this.set('_isQuestionType', true);
    		}
    	},
        _parent:'blocks',
    	_siblings:'components'
    });
    
    return ComponentModel;

});