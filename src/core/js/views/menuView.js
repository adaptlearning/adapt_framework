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
            var visible = "visibility-hidden";
            if (this.model.get('_isVisible')) {
                visible = "";
            }
    		return 'menu ' 
            + 'menu-' 
            + this.model.get('_id')
            + " " + this.setVisibility();
    	},

        preRender: function() {
            this.$el.css('opacity', 0);
            this.listenTo(this.model, 'change:_isReady', this.isReady);
        },
        
        postRender: function() { 
        },
        
        isReady: function() {
            if (this.model.get('_isReady')) {
                _.defer(_.bind(function() {
                    $('.loading').hide();
                    $(window).scrollTop(0);
                    Adapt.trigger('menuView:ready', this);
                    this.$el.animate({'opacity': 1}, 'fast');
                    $(window).scroll();
                }, this));
            }
        }
        
    }, {
        type:'menu'
    });
    
    return MenuView;
    
});