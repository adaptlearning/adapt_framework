/*
* Adapt
* License - https://github.com/adaptlearning/adapt_framework/blob/master/LICENSE
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