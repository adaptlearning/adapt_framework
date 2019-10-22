define([
    'core/js/adapt',
    'core/js/views/adaptView'
], function(Adapt, AdaptView) {

    var MenuView = AdaptView.extend({

    	className: function() {
            var visible = "visibility-hidden";
            if (this.model.get('_isVisible')) {
                visible = "";
            }
    		return 'menu ' +
            'menu-' +
            this.model.get('_id') +
            " " + this.model.get('_classes') +
            " " + this.setVisibility() +
            " " + (this.model.get('_isComplete') ? 'completed' : '');
    	},

        preRender: function() {
            $.inview.lock('menuView');
            this.disableAnimation = Adapt.config.has('_disableAnimation') ? Adapt.config.get('_disableAnimation') : false;
            this.$el.css('opacity', 0);
            this.listenTo(this.model, 'change:_isReady', this.isReady);
        },

        postRender: function() {
        },

        isReady: function() {
            if (!this.model.get('_isReady')) return;

            var performIsReady = function() {
                $('.loading').hide();
                $(window).scrollTop(0);
                Adapt.trigger('menuView:ready', this);
                $.inview.unlock('menuView');
                var styleOptions = { opacity: 1 };
                if (this.disableAnimation) {
                    this.$el.css(styleOptions);
                    $.inview.unlock('menuView');
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
            }.bind(this);

            Adapt.wait.queue(function() {
                _.defer(performIsReady);
            });

        }

    }, {
        type:'menu'
    });

    return MenuView;

});
