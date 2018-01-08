define([
    'core/js/views/adaptView',
    'core/js/views/blockView'
], function(AdaptView, BlockView) {

    var ArticleView = AdaptView.extend({
        
        className: function() {
            return "article " +
            this.model.get('_id') +
            " " + this.model.get('_classes') +
            " " + this.setVisibility() +
            " " + this.setHidden() +
            " nth-child-" +
            this.model.get("_nthChild") +
            " " + (this.model.get('_isComplete') ? 'completed' : '');
        }

    }, {
        childContainer: '.block-container',
        childView: BlockView,
        type: 'article',
        template: 'article'
    });

    return ArticleView;

});
