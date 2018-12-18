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
      this.template = "navigation";
      this.preRender();
    },

    events: {
      'click [data-event]':'triggerEvent'
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
        $('.nav__back-btn, .nav-home-button').addClass('u-display-none');
      } else {
        this.showNavigationButton();
      }
    },

    showNavigationButton: function() {
      $('.nav__back-btn, .nav-home-button').removeClass('u-display-none');
    }

  });

  return NavigationView;

});
