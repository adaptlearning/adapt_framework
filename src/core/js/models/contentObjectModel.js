define([
    'core/js/adapt',
    'core/js/models/adaptModel'
], function (Adapt, AdaptModel) {

    var ContentObjectModel = AdaptModel.extend({
    	_parent:'course',
    	_siblings:'contentObjects',
        _children: 'contentObjects'
    });

    return ContentObjectModel;
});
