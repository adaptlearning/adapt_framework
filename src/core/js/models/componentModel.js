define(["coreModels/adaptModel"], function(AdaptModel) {

    var ComponentModel = AdaptModel.extend({
        
        initialize: function() {
            console.log('Component Created');
        }
        
    }, {
        parent:'blocks',
        siblings:'components'
    });
    
    return ComponentModel;

});