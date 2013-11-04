define(["coreModels/adaptModel"], function(AdaptModel) {

    var BlockModel = AdaptModel.extend({
        
        initialize: function() {
            console.log('BlockModel Created');
        }
        
    }, {
        parent:'articles',
        siblings:'blocks',
        children:'components'
    });
    
    return BlockModel;

});