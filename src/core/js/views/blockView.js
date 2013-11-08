/*
* ArticleView
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Daryl Hedley
*/

define(["handlebars", "coreJS/adapt", "coreViews/adaptView", "./../components/text/js/text.js"], function(Handlebars, Adapt, AdaptView, text) {
    
    var BlockView = AdaptView.extend({
        
        className: function() {
            return "block " + this.model.get('_id');
        },
        
        init: function() {
            this.template = 'block';
            this.$parent = this.options.$parent;
        },
        
        postRender: function() {
            this.addChildren();
        },
        
        addChildren: function() {
            this.model.getChildren().each(function(model) {
                new Adapt.componentStore[model.get("_component")]({
                    model:model, 
                    $parent:$('.component-container', this.$el)
                });
            }, this);
        }
        
    });
    
    return BlockView;
    
});