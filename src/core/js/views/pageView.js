/*
* PageView
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Daryl Hedley
*/

define(function(require) {
    
    var AdaptView = require('coreViews/adaptView');
    var ArticleView = require('coreViews/articleView');
    var Adapt = require('coreJS/adapt');

    var PageView = AdaptView.extend({
        
        className: function() {
            return "page " + this.model.get('_id');                  
        },
        
        preRender: function() {
            this.listenTo(this.model, 'change:_isReady', this.isReady);
        },
        
        isReady: function() {
            _.defer(function() {
                $('.loading').hide();
                $(window).scroll();
                Adapt.trigger('pageView:ready');
            });
        }
        
    }, {
        childContainer: '.article-container',
        childView: ArticleView,
        template: 'page'
    });
    
    return PageView;
    
});