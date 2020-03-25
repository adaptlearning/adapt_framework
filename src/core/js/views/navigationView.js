define([
  'core/js/adapt'
], function(Adapt) {

  class NavigationView extends Backbone.View {

    className() {
      return 'nav';
    }

    events() {
      return {
        'click [data-event]': 'triggerEvent'
      };
    }

    attributes() {
      return {
        'role': 'navigation'
      };
    }

    initialize() {
      this.listenToOnce(Adapt, {
        'courseModel:dataLoading': this.remove
      });
      this.listenTo(Adapt, 'router:menu router:page', this.hideNavigationButton);
      this.preRender();
    }

    preRender() {
      Adapt.trigger('navigationView:preRender', this);
      this.render();
    }

    render() {
      var template = Handlebars.templates[this.constructor.template];
      this.$el.html(template({
          _globals: Adapt.course.get('_globals'),
          _accessibility: Adapt.config.get('_accessibility')
      })).insertBefore('#app');

      _.defer(() => {
        Adapt.trigger('navigationView:postRender', this);
      });

      return this;
    }

    triggerEvent(event) {
      event.preventDefault();
      var currentEvent = $(event.currentTarget).attr('data-event');
      Adapt.trigger('navigation:' + currentEvent);
      switch (currentEvent) {
        case 'backButton':
          Adapt.router.navigateToPreviousRoute();
          break;
        case 'homeButton':
          Adapt.router.navigateToHomeRoute();
          break;
        case 'parentButton':
          Adapt.router.navigateToParent();
          break;
        case 'skipNavigation':
          this.skipNavigation();
          break;
        case 'returnToStart':
          Adapt.startController.returnToStartLocation();
          break;
      }
    }

    skipNavigation() {
      Adapt.a11y.focusFirst('.' + Adapt.location._contentType);
    }

    hideNavigationButton(model) {
      const shouldHide = (model.get('_type') === 'course');
      this.$('.nav__back-btn, .nav__home-btn').toggleClass('u-display-none', shouldHide);
    }

    showNavigationButton() {
      this.$('.nav__back-btn, .nav__home-btn').removeClass('u-display-none');
    }

  }

  NavigationView.template = 'nav';

  return NavigationView;

});
