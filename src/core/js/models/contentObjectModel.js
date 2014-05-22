/*
* Adapt
* License - https://github.com/adaptlearning/adapt_framework/blob/master/LICENSE
* Maintainers - Daryl Hedley <darylhedley@gmail.com>
*/

define(function(require) {

    var AdaptModel = require('coreModels/adaptModel');
    var Adapt = require('coreJS/adapt');

    var ContentObjectModel = AdaptModel.extend({

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