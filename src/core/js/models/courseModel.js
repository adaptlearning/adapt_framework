/*
* Adapt
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Daryl Hedley
*/

define(["coreModels/adaptModel", "coreJS/adapt"], function(AdaptModel, Adapt) {

    var CourseModel = AdaptModel.extend({
    
        initialize: function(options) {
            this.url = options.url;
            this.on('sync', this.loadedData, this);
            this.fetch();
        },
        
        loadedData: function() {
            Adapt.trigger('loaded:data');
        }
    
    }, {
        children: "contentObjects"
    });
    
    return CourseModel;

});