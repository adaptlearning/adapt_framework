define([
  'core/js/adapt',
  'core/js/views/navigationView'
], function(Adapt, NavigationView) {

  class NavigationController extends Backbone.Controller {

    initialize() {
      this.listenTo(Adapt, 'adapt:preInitialize', this.addNavigationBar);
    }

    addNavigationBar() {
      var adaptConfig = Adapt.course.get('_navigation');

      if (adaptConfig && adaptConfig._isDefaultNavigationDisabled) {
        Adapt.trigger('navigation:initialize');
        return;
      }

      Adapt.navigation = new NavigationView();// This should be triggered after 'app:dataReady' as plugins might want to manipulate the navigation
    }

  }

  return new NavigationController();

});
