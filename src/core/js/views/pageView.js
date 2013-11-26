/*
* PageView
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Daryl Hedley
*/

define(["handlebars", "coreViews/adaptView", "coreViews/articleView"], function(Handlebars, AdaptView, ArticleView) {
    
    var PageView = AdaptView.extend({
        
        className: function() {
            return "page " + this.model.get('_id');                  
        }
        
    }, {
        childContainer: '.article-container',
        childView: ArticleView,
        template: 'page'
    });
    
    return PageView;
    
});