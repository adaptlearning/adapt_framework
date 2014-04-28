/*
* Adapt
* License - https://github.com/adaptlearning/adapt_framework/blob/master/LICENSE
* Maintainers - Daryl Hedley
*/

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