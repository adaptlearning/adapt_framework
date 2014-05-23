/*
* AdaptCollection
* License - https://github.com/adaptlearning/adapt_framework/blob/master/LICENSE
* Maintainers - Daryl Hedley
*/

define(function(require) {

    var Backbone = require('backbone');
    var Adapt = require('coreJS/adapt');

    var AdaptCollection = Backbone.Collection.extend({
        initialize : function(models, options){
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