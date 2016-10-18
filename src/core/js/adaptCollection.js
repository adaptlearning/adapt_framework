define(function(require) {

    var Backbone = require('backbone');
    var Adapt = require('coreJS/adapt');

    var AdaptCollection = Backbone.Collection.extend({
        initialize : function(models, options){
            this.url = options.url;

            this.once('reset', this.loadedData, this);
            if (this.url) {
                this.fetch({
                    reset:true,
                    error: _.bind(function(model, xhr, options) {
                        console.error("ERROR: unable to load file " + this.url);
                    }, this)
                });
            }
        },

        loadedData: function() {
            Adapt.trigger('adaptCollection:dataLoaded');
        }

    });

    return AdaptCollection;

});
