/*
* ComponentView
* License - https://github.com/adaptlearning/adapt_framework/blob/master/LICENSE
* Maintainers - Daryl Hedley
*/

define(function(require) {

    var AdaptView = require('coreViews/adaptView');

    var ComponentView = AdaptView.extend({
    
        className: function() {
            return "component " 
            + this.model.get('_component')
            + "-component " + this.model.get('_id') 
            + " " + this.model.get('_classes')
            + " " + this.setVisibility()
            + " component-" + this.model.get('_layout')
            + " nth-child-" + this.options.nthChild;
        },
        
        postRender: function() {}
        
    }, {
        type:'component'
    });
    
    return ComponentView;

});