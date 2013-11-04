define(["backbone", "coreJS/adapt"], function(Backbone, Adapt) {

    var AdaptCollection = Backbone.Collection.extend({
        initialize : function(models, options){
            this.url = options.url;
            this.once('reset', this.loadedData, this);
            this.fetch({reset:true});
        },
        
        loadedData: function() {
            Adapt.trigger('adaptCollection:dataLoaded');
        }
        
    });
    
    return AdaptCollection;

});