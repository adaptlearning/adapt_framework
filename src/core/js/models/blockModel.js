/*
* Adapt
* License - https://github.com/adaptlearning/adapt_framework/blob/master/LICENSE
* Maintainers - Daryl Hedley <darylhedley@gmail.com>
*/

define(function(require) {

	var Adapt = require('coreJS/adapt');
	var AdaptModel = require('coreModels/adaptModel');

    var BlockModel = AdaptModel.extend({

        setupChildListeners: function () {
            AdaptModel.prototype.setupChildListeners.apply(this, arguments);
            this.set({_isInteractionsComplete: false, silent:true});
            this.getChildren().each(function(child) {
            	this.listenTo(child, 'change:_isInteractionsComplete', this.checkInteractionStatus);
            }, this);
        },

        checkInteractionStatus: function () {
            if (this.getChildren().findWhere({_isInteractionsComplete: false})) {
                this.set('_isInteractionsComplete', false);
                return;
            }
            this.set('_isInteractionsComplete', true);
            Adapt.trigger('blockModel:interactionsComplete', this);
        },

        _parent: 'articles',
    	_siblings:'blocks',
        _children: 'components'
    });
    
    return BlockModel;

});