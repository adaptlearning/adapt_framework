define([
  'core/js/adapt'
], function(Adapt) {

  var NavigationView = Backbone.View.extend({

    className: "nav",

    initialize: function() {
      this.listenToOnce(Adapt, {
        'courseModel:dataLoading': this.remove
      });
      this.listenTo(Adapt, 'router:menu router:page', this.hideNavigationButton);
      this.template = "nav";
      this.preRender();
    },

    events: {
      'click [data-event]': 'triggerEvent'
    },

    attributes: {
      'role': 'navigation'
    },

    preRender: function() {
      Adapt.trigger('navigationView:preRender', this);
      this.render();
    },

    render: function() {
      var template = Handlebars.templates[this.template];
      this.$el.html(template(
        {
          _globals: Adapt.course.get("_globals"),
          _accessibility: Adapt.config.get("_accessibility")
        }
      )).insertBefore('#app');

      _.defer(_.bind(function() {
        Adapt.trigger('navigationView:postRender', this);
      }, this));

      return this;
    },

    triggerEvent: function(event) {
      event.preventDefault();
      var currentEvent = $(event.currentTarget).attr('data-event');
      Adapt.trigger('navigation:' + currentEvent);
    },

    hideNavigationButton: function(model) {
      if (model.get('_type') === "course") {
        $('.nav__back-btn, .nav__home-btn').addClass('u-display-none');
      } else {
        this.showNavigationButton();
      }
    },

    showNavigationButton: function() {
      $('.nav__back-btn, .nav__home-btn').removeClass('u-display-none');
    }

  });

  return NavigationView;

});
