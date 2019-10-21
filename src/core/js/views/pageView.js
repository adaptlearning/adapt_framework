define([
  'core/js/adapt',
  'core/js/views/adaptView',
  'core/js/views/articleView'
], function(Adapt, AdaptView, ArticleView) {

  var PageView = AdaptView.extend({

    attributes: function() {
      return AdaptView.resultExtend('attributes', {
        "aria-labelledby": this.model.get('_id')+"-heading",
        "role": "main"
      }, this);
    },

    className: function() {
      return [
        'page',
        this.model.get('_id'),
        this.model.get('_classes'),
        this.setVisibility(),
        (this.model.get('_isComplete') ? 'is-complete' : ''),
        (this.model.get('_isOptional') ? 'is-optional' : '')
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
        Adapt.trigger('pageView:ready', this);
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
    },

    remove: function() {
      if (this.$pageLabel) {
        this.$pageLabel.remove();
      }
      AdaptView.prototype.remove.call(this);
    }

  }, {
    childContainer: '.article__container',
    childView: ArticleView,
    type: 'page',
    template: 'page'
  });

  return PageView;

});
