/*
* Adapt
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Daryl Hedley
*/

define(function(require) {

    var AdaptModel = require('coreModels/adaptModel');
    var Adapt = require('coreJS/adapt');

    var CourseModel = AdaptModel.extend({
    
        initialize: function(options) {
            this.url = options.url;
            this.on('sync', this.loadedData, this);
            this.fetch();
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