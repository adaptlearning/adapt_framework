define([
    'core/js/adapt',
    'core/js/views/adaptView',
    'core/js/views/articleView'
], function(Adapt, AdaptView, ArticleView) {

    var PageView = AdaptView.extend({
        
        className: function() {
            return "page " + 
            this.model.get('_id') + 
            " " + this.model.get('_classes') + 
            " " + this.setVisibility();
        },

        preRender: function() {
            this.disableAnimation = Adapt.config.has('_disableAnimation') ? Adapt.config.get('_disableAnimation') : false;
            this.$el.css('opacity', 0);
            this.listenTo(this.model, 'change:_isReady', this.isReady);
        },

        isReady: function() {
            if (this.model.get('_isReady')) {
                _.defer(_.bind(function() {
                    $('.loading').hide();
                    $(window).scrollTop(0);
                    Adapt.trigger('pageView:ready', this);
                    var styleOptions = { opacity: 1 };
                    if (this.disableAnimation) {
                        this.$el.css(styleOptions);
                        $.inview();
                    } else {
                        this.$el.velocity(styleOptions, {
                            duration: 'fast',
                            complete: function() {
                                $.inview();
                            }
                        });
                    }
                    $(window).scroll();
                }, this));
            }
        }

    }, {
        childContainer: '.article-container',
        childView: ArticleView,
        type: 'page',
        template: 'page'
    });

    return PageView;

});