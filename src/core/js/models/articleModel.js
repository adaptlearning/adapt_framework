define([
    'core/js/models/adaptModel'
], function (AdaptModel) {

    var ArticleModel = AdaptModel.extend({
        _parent:'contentObjects',
    	_siblings:'articles',
        _children: 'blocks'
    });

    return ArticleModel;

});
