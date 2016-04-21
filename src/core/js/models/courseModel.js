define(function(require) {

    var AdaptModel = require('coreModels/adaptModel');
    var Adapt = require('coreJS/adapt');

    var CourseModel = AdaptModel.extend({

        initialize: function(attrs, options) {
            AdaptModel.prototype.initialize.apply(this, arguments);

            this.url = options.url;

            this.on('sync', this.loadedData, this);
            if (this.url) {
                this.fetch();
            }
        },

        loadedData: function() {
            Adapt.trigger('courseModel:dataLoaded');
        },

        _children: "contentObjects"

    });

    return CourseModel;

});
