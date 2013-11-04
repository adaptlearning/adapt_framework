/*
* Adapt
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Daryl Hedley
*/

define(["coreModels/adaptModel", "coreJS/adapt"], function(AdaptModel, Adapt) {

    var ArticleModel = AdaptModel.extend({
        
        initialize: function() {
            console.log('ArticleModel Created');
            Adapt.on('app:dataReady', _.bind(function() {
                console.log(this.getSiblings());
            }, this));
        }
        
    }, {
        parent:'contentObjects',
        siblings:'articles',
        children:'blocks'
    });
    
    return ArticleModel;

});