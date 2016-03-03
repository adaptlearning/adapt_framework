define(function(require) {

	var AdaptModel = require('coreModels/adaptModel');

    var BlockModel = AdaptModel.extend({
        _parent:'articles',
    	_siblings:'blocks',
        _children: 'components',
        
        defaults: function() {
            return _.extend({
                _sortComponents: true
            }, AdaptModel.prototype.defaults);
        }
    });

    return BlockModel;

});
