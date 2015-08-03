define(function(require) {

    var AdaptModel = require('coreModels/adaptModel');
    var Adapt = require('coreJS/adapt');

    var CourseModel = AdaptModel.extend({

        initialize: function(attrs, options) {
            this.url = options.url;

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
                "change:_isComplete": this.checkCompletionStatus,
                "change:_isInteractionComplete": this.checkInteractionCompletionStatus
            }, this);
        },

        _children: "contentObjects"

    });

    return CourseModel;

});
