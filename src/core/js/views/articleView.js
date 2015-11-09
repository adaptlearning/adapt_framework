define(function(require) {

    var AdaptView = require('coreViews/adaptView');
    var BlockView = require('coreViews/blockView');

    var ArticleView = AdaptView.extend({
        var _classes = this.model.has('_classes') ? " " + this.model.get('_classes'):"";
        className: function() {
            return "article "
            + this.model.get('_id')
            + _classes
            + " " + this.setVisibility()
            + " nth-child-"
            + this.model.get("_nthChild");
        }

    }, {
        childContainer: '.block-container',
        childView: BlockView,
        type: 'article',
        template: 'article'
    });

    return ArticleView;

});
