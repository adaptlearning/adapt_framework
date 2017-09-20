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
            " " + this.setVisibility();
    	},

        preRender: function() {
            this.disableAnimation = Adapt.config.has('_disableAnimation') ? Adapt.config.get('_disableAnimation') : false;
            this.$el.css('opacity', 0);
            this.listenTo(this.model, 'change:_isReady', this.isReady);
        },

        postRender: function() {
        },

        isReady: function() {
            if (this.model.get('_isReady')) {
                _.defer(_.bind(function() {
                    $('.loading').hide();
                    $(window).scrollTop(0);
                    Adapt.trigger('menuView:ready', this);
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
        type:'menu'
    });

    return MenuView;

});
