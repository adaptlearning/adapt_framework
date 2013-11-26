/*
* BlockView
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Daryl Hedley
*/

define(["handlebars", "coreJS/adapt", "coreViews/adaptView"], function(Handlebars, Adapt, AdaptView) {
    
    var BlockView = AdaptView.extend({
        
        className: function() {
            return "block " + this.model.get('_id');
        }
        
    }, {
        childContainer: '.component-container',
        template: 'block'
    });
    
    return BlockView;
    
});