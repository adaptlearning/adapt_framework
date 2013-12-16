/*
* MenuView
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Daryl Hedley
*/

define(function(require) {

    var AdaptView = require('coreViews/adaptView');
    var Handlebars = require('handlebars');
    var Adapt = require('coreJS/adapt');
    
    var MenuView = AdaptView.extend({

    	className: function() {
    		return 'menu ' + 'menu-' + this.model.get('_id');
    	},

    	initialize: function() {
    		$('#wrapper').removeClass().addClass('location-menu');
    		this.model.set('_isReady', false);
            this.listenTo(Adapt, 'remove', this.remove);
            this.preRender();
            this.render();
    	},
        
        postRender: function() { 
        }
        
    });
    
    return MenuView;
    
});