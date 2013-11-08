/*
* ArticleView
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Daryl Hedley
*/

define(["handlebars", "coreViews/adaptView", "coreViews/blockView"], function(Handlebars, AdaptView, BlockView) {
    
    var ArticleView = AdaptView.extend({
        
        className: function() {
            return "article " + this.model.get('_id');
        },
        
        init: function() {
            this.template = 'article';
            this.$parent = this.options.$parent;
        },
        
        postRender: function() {
            this.addChildren();
        },
        
        addChildren: function() {
            this.model.getChildren().each(_.bind(function(model) {
                new BlockView({model:model, $parent:$('.block-container', this.$el)});
            }, this));
        }
        
    });
    
    return ArticleView;
    
});