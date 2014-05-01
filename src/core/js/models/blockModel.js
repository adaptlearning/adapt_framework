/*
* Adapt
* License - https://github.com/adaptlearning/adapt_framework/blob/master/LICENSE
* Maintainers - Daryl Hedley
*/

define(function(require) {

	var AdaptModel = require('coreModels/adaptModel');

    var BlockModel = AdaptModel.extend({
        _parent:'articles',
    	_siblings:'blocks',
        _children: 'components'
    });
    
    return BlockModel;

});