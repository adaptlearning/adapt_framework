/*
* BlockView
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Daryl Hedley
*/

define(function(require) {
    
	var AdaptView = require('coreViews/adaptView');

    var BlockView = AdaptView.extend({
        
        className: function() {
            return [
                "block ",
                this.model.get('_id'),
                this.model.get('_classes'),
                this.setVisibility(),
                "nth-child-" + this.options.nthChild
            ].join(' ');
        },

        preRender: function() {
            this.listenTo(this.model, 'change:_isVisible', this.isVisible);
        },
        
        isVisible: function() {
            _.defer(_.bind(function() {
                $(window).scroll();
            }, this));
        }
        
    }, {
        childContainer: '.component-container',
        template: 'block'
    });
    
    return BlockView;
    
});