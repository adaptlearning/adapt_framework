define([
  'core/js/adapt',
  'core/js/views/navigationView'
], function(Adapt, NavigationView) {

  var NavigationController = Backbone.Controller.extend({

    initialize: function() {
      this.listenTo(Adapt, 'adapt:preInitialize', this.addNavigationBar);
    },

    addNavigationBar: function() {
      var adaptConfig = Adapt.course.get('_navigation');

      if (adaptConfig && adaptConfig._isDefaultNavigationDisabled) {
        Adapt.trigger('navigation:initialize');
        return;
      }

      Adapt.navigation = new NavigationView();// This should be triggered after 'app:dataReady' as plugins might want to manipulate the navigation
    }

  });

  return new NavigationController();

});
