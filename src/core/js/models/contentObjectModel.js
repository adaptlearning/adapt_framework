/*
* Adapt
* License - https://github.com/adaptlearning/adapt_framework/blob/master/LICENSE
* Maintainers - Daryl Hedley <darylhedley@gmail.com>
*/

define(function(require) {

    var AdaptModel = require('coreModels/adaptModel');
    var Adapt = require('coreJS/adapt');

    var ContentObjectModel = AdaptModel.extend({

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
            Adapt.trigger('contentObjectModel:interactionsComplete', this);
        },

    	getCompleteComponentsAsPercentage: function() {
    		var children = this.findDescendants('components');
    		var availableChildren = children.where({_isAvailable:true});
            var childrenLength = children.length;
            var completedChildrenLength = children.where({_isComplete:true, _isAvailable:true}).length;
            var completedChildrenAsPercentage = (completedChildrenLength/childrenLength)*100;

            this.set({'completedChildrenAsPercentage': completedChildrenAsPercentage});
            return completedChildrenAsPercentage;
    	},
    	
    	_parent:'course',
    	_siblings:'contentObjects',
        _children: 'contentObjects'
    });
    
    return ContentObjectModel;

});