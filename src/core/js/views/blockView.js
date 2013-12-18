/*
* BlockView
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Daryl Hedley
*/

define(function(require) {
    
	var AdaptView = require('coreViews/adaptView');

    var BlockView = AdaptView.extend({
        
        className: function() {
            return "block " 
            + this.model.get('_id') 
            + " nth-child-" 
            + this.options.nthChild;;
        }
        
    }, {
        childContainer: '.component-container',
        template: 'block'
    });
    
    return BlockView;
    
});