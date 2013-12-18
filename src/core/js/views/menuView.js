/*
* MenuView
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Daryl Hedley
*/

define(function(require) {

    var AdaptView = require('coreViews/adaptView');
    var Adapt = require('coreJS/adapt');
    
    var MenuView = AdaptView.extend({

    	className: function() {
    		return 'menu ' 
            + 'menu-' 
            + this.model.get('_id');
    	},
        
        postRender: function() { 
        }
        
    });
    
    return MenuView;
    
});