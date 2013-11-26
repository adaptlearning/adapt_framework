/*
* Adapt
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Daryl Hedley
*/

define(["coreModels/adaptModel", "coreJS/adapt"], function(AdaptModel, Adapt) {

    var ArticleModel = AdaptModel.extend({
        
        init: function() {
        }
        
    }, {
        parent:'contentObjects',
        siblings:'articles',
        children:'blocks'
    });
    
    return ArticleModel;

});