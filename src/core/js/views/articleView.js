/*
* ArticleView
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Daryl Hedley
*/

define(["handlebars", "coreViews/adaptView", "coreViews/blockView"], function(Handlebars, AdaptView, BlockView) {
    
    var ArticleView = AdaptView.extend({
        
        className: function() {
            return "article " + this.model.get('_id');
        }
        
    }, {
        childContainer: '.block-container',
        childView: BlockView,
        template: 'article'
    });
    
    return ArticleView;
    
});