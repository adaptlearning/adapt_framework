/*
* Adapt
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Daryl Hedley
*/

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