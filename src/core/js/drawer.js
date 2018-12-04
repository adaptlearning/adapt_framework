define([
  'core/js/adapt',
  'core/js/views/drawerView'
], function(Adapt, DrawerView) {

  var DrawerCollection = new Backbone.Collection(null, { comparator: 'drawerOrder' });
  var Drawer = {};

  Drawer.addItem = function(drawerObject, eventCallback) {
    drawerObject.eventCallback = eventCallback;
    DrawerCollection.add(drawerObject);
  };

  Drawer.triggerCustomView = function(view, hasBackButton) {
    if (hasBackButton !== false) {
      hasBackButton = true;
    }
    Adapt.trigger('drawer:triggerCustomView', view, hasBackButton);
  };

  Adapt.on({
    'adapt:start': function() {
      new DrawerView({ collection: DrawerCollection });
    },
    'app:languageChanged': function() {
      Adapt.trigger('drawer:remove');
    }
  });

  Adapt.drawer = Drawer;

});
