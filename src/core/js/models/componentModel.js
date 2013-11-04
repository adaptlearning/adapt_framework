/*
* Adapt
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Daryl Hedley
*/

define(["coreModels/adaptModel"], function(AdaptModel) {

    var ComponentModel = AdaptModel.extend({
        
        initialize: function() {
            console.log('Component Created');
        }
        
    }, {
        parent:'blocks',
        siblings:'components'
    });
    
    return ComponentModel;

});