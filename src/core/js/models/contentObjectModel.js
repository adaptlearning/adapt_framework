define(function(require) {

    var AdaptModel = require('coreModels/adaptModel');
    var Adapt = require('coreJS/adapt');

    var ContentObjectModel = AdaptModel.extend({
    	_parent:'course',
    	_siblings:'contentObjects',
        _children: 'contentObjects'
    });

    return ContentObjectModel;
});
