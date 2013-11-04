define(["coreModels/adaptModel", "coreJS/adapt"], function(AdaptModel, Adapt) {

    var CourseModel = AdaptModel.extend({
    
        initialize: function(options) {
            this.url = options.url;
            console.log('course model loaded');
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