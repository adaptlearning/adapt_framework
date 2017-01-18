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
            " nth-child-" +
            this.model.get("_nthChild");
        }

    }, {
        childContainer: '.block-container',
        childView: BlockView,
        type: 'article',
        template: 'article'
    });

    return ArticleView;

});