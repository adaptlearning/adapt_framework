/*
* AdaptCollection
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
        },
        
        setOnChildren: function(key, val){
            var attrs;
            if(!_.isObject(key)) (attrs = {})[key] = val;
            else attrs = key;
            _.each(this.models, function(model){
                model.setOnChildren(attrs);
            })
        }
        
    });
    
    return AdaptCollection;

});