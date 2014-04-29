/*
* ArticleView
* License - https://github.com/adaptlearning/adapt_framework/blob/master/LICENSE
* Maintainers - Daryl Hedley
*/

define(function(require) {
    
    var AdaptView = require('coreViews/adaptView');
    var BlockView = require('coreViews/blockView');

    var ArticleView = AdaptView.extend({
        
        className: function() {
            return "article " 
            + this.model.get('_id')
            + " " + this.model.get('_classes')
            + " " + this.setVisibility() 
            + " nth-child-" 
            + this.options.nthChild;
        }
        
    }, {
        childContainer: '.block-container',
        childView: BlockView,
        type: 'article',
        template: 'article'
    });
    
    return ArticleView;
    
});