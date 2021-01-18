import Adapt from 'core/js/adapt';
import DrawerView from 'core/js/views/drawerView';

const DrawerCollection = new Backbone.Collection(null, { comparator: 'drawerOrder' });
const Drawer = {};

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
  'adapt:start'() {
    new DrawerView({ collection: DrawerCollection });
  },
  'app:languageChanged'() {
    Adapt.trigger('drawer:remove');
  }
});

export default (Adapt.drawer = Drawer);
