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
            " " + this.setVisibility() +
            " " + (this.model.get('_isComplete') ? 'completed' : '');
        },

        preRender: function() {
            this.disableAnimation = Adapt.config.has('_disableAnimation') ? Adapt.config.get('_disableAnimation') : false;
            this.$el.css('opacity', 0);
            this.listenTo(this.model, 'change:_isReady', this.isReady);

            var accessibility = Adapt.config.get('_accessibility');
            if (!accessibility._isEnabled && !accessibility._isEnabledOnTouchDevices) {
                return;
            }
            // create aria-label outside of #wrapper
            this.$pageLabel = $('<div/>', {
                'class': 'aria-label relative a11y-ignore-focus prevent-default',
                tabindex: 0,
                role: 'region',
                text: Adapt.course.get('_globals')._accessibility._ariaLabels.pageEnd
            }).appendTo('body');
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
        },

        remove: function() {
            if (this.$pageLabel) {
                this.$pageLabel.remove();
            }
            AdaptView.prototype.remove.call(this);
        }

    }, {
        childContainer: '.article-container',
        childView: ArticleView,
        type: 'page',
        template: 'page'
    });

    return PageView;

});
