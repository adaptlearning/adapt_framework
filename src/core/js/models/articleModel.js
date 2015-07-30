define(function(require) {

	var AdaptModel = require('coreModels/adaptModel');
	var Adapt = require('coreJS/adapt');

    var ArticleModel = AdaptModel.extend({
        _parent:'contentObjects',
    	_siblings:'articles',
        _children: 'blocks'
    });

    return ArticleModel;

});
