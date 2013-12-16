/*
* Adapt
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Daryl Hedley
*/

define(function(require) {

	var AdaptModel = require('coreModels/adaptModel');

    var ComponentModel = AdaptModel.extend({
        
    }, {
        parent:'blocks',
        siblings:'components'
    });
    
    return ComponentModel;

});