/*
* Adapt
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Daryl Hedley
*/

define(["coreModels/adaptModel"], function(AdaptModel) {

    var BlockModel = AdaptModel.extend({
        
        init: function() {
        }
        
    }, {
        parent:'articles',
        siblings:'blocks',
        children:'components'
    });
    
    return BlockModel;

});