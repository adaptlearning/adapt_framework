define(function(require) {

    var Backbone = require('backbone');
    var Adapt = require('coreJS/adapt');

    var AdaptCollection = Backbone.Collection.extend({
        initialize : function(models, options){
            this.url = options.url;

            this.once('reset', this.loadedData, this);
            if (this.url) {
                this.fetch({reset:true});
            }
        },

        loadedData: function() {
            Adapt.trigger('adaptCollection:dataLoaded');
        }

    });

    return AdaptCollection;

});
