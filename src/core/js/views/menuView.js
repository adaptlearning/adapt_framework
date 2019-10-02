define([
  'core/js/adapt',
  'core/js/views/adaptView',
  'core/js/views/menuItemView'
], function(Adapt, AdaptView, MenuItemView) {

  var MenuView = AdaptView.extend({

    attributes: function() {
      return AdaptView.resultExtend('attributes', {
        'role': 'main',
        'aria-labelledby': this.model.get('_id')+'-heading'
      }, this);
    },

    className: function() {
      return [
        'menu',
        this.constructor.className,
        this.model.get('_id'),
        this.model.get('_classes'),
        this.setVisibility(),
        (this.model.get('_isComplete') ? 'is-complete' : '')
      ].join(' ');
    },

    preRender: function() {
      this.disableAnimation = Adapt.config.has('_disableAnimation') ? Adapt.config.get('_disableAnimation') : false;
      this.$el.css('opacity', 0);
      this.listenTo(this.model, 'change:_isReady', this.isReady);
    },

    isReady: function() {
      if (!this.model.get('_isReady')) return;

      var performIsReady = function() {
        $('.js-loading').hide();
        $(window).scrollTop(0);
        Adapt.trigger('menuView:ready', this);
        var styleOptions = { opacity: 1 };
        if (this.disableAnimation) {
          this.$el.css(styleOptions);
          $.inview();
          return;
        }
        this.$el.velocity(styleOptions, {
          duration: 'fast',
          complete: function() {
            $.inview();
          }
        });
        $(window).scroll();
      }.bind(this);

      Adapt.wait.queue(function() {
        _.defer(performIsReady);
      });
    }

  }, {
    childContainer: '.js-children',
    childView: MenuItemView,
    type: 'menu',
    template: 'menu'
  });

  return MenuView;

});
