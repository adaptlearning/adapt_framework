/*
* PageView
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Daryl Hedley
*/

define(["handlebars", "coreViews/adaptView", "coreViews/articleView"], function(Handlebars, AdaptView, ArticleView) {
    
    var PageView = AdaptView.extend({
        
        className: function() {
            return "page " + this.model.get('_id');                  
        },
        
        init: function() {
            this.template = 'page';
            this.$parent = $('#wrapper');
        },
        
        postRender: function() {
            this.addChildren();
        },
        
        addChildren: function() {
            this.model.getChildren().each(function(model) {
                new ArticleView({model:model, $parent:$('.article-container', this.$el)});
            }, this);
        }
        
    });
    
    return PageView;
    
});