/*
* Adapt
* License - https://github.com/adaptlearning/adapt_framework/blob/master/LICENSE
* Maintainers - Daryl Hedley <darylhedley@gmail.com>
*/

define(function(require) {

    var AdaptModel = require('coreModels/adaptModel');
    var Adapt = require('coreJS/adapt');

    var CourseModel = AdaptModel.extend({
    
        initialize: function(attrs, options) {
            this.on('sync', this.loadedData, this);
            if (this.url) {
                this.fetch();
            }
        },
        
        loadedData: function() {
            Adapt.trigger('courseModel:dataLoaded');
            this.setupListeners();
        },

        setupListeners: function() {
            Adapt[this._children].on({
                "change:_isReady": this.checkReadyStatus,
                "change:_isComplete": this.checkCompletionStatus
            }, this);
        },

        _children: "contentObjects"
    
    });
    
    return CourseModel;

});