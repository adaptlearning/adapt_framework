define(["coreModels/adaptModel"], function(AdaptModel) {

    var ContentObjectModel = AdaptModel.extend({
        
        initialize: function() {
            console.log('ContentObjectModel Created');
        }
        
    }, {
        parent:'course',
        siblings:'contentObjects',
        children:'articles'
    });
    
    return ContentObjectModel;

});