/*
* ComponentView
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Daryl Hedley
*/

define(["handlebars", "coreViews/adaptView"], function(Handlebars, AdaptView) {

    var ComponentView = AdaptView.extend({
    
        className: function() {
            return "component " 
            + this.model.get('_component')
            + "-component " + this.model.get('_id') 
            + " component-" + this.model.get('_layout');
        },
        
        init: function() {
            this.constructor.template = this.model.get('_component');
        }
        
    });
    
    return ComponentView;

});