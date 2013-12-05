/*
* PageView
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Daryl Hedley
*/

define(["handlebars", "coreViews/adaptView", "coreViews/articleView", "coreJS/adapt"], function(Handlebars, AdaptView, ArticleView, Adapt) {
    
    var PageView = AdaptView.extend({
        
        className: function() {
            return "page " + this.model.get('_id');                  
        },
        
        init: function() {
            this.listenTo(this.model, 'change:_isReady', this.isReady);
        },
        
        isReady: function() {
            Adapt.trigger('pageView:ready');
            // comment to be removed
        }
        
    }, {
        childContainer: '.article-container',
        childView: ArticleView,
        template: 'page'
    });
    
    return PageView;
    
});