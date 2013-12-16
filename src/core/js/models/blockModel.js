/*
* Adapt
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Daryl Hedley
*/

define(function(require) {

	var AdaptModel = require('coreModels/adaptModel');

    var BlockModel = AdaptModel.extend({
        
    }, {
        parent:'articles',
        siblings:'blocks',
        children:'components'
    });
    
    return BlockModel;

});