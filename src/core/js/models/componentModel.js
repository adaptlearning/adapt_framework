define([
    'coreJS/adapt',
    'coreModels/adaptModel'
], function(Adapt, AdaptModel) {

    var ComponentModel = AdaptModel.extend({
        _parent:'blocks',
    	_siblings:'components'
    });

    return ComponentModel;

});
