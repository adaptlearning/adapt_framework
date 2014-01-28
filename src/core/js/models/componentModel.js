/*
* Adapt
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Daryl Hedley
*/

define(function(require) {

	var AdaptModel = require('coreModels/adaptModel');

    var ComponentModel = AdaptModel.extend({
        _parent:'blocks',
    	_siblings:'components'
    });
    
    return ComponentModel;

});