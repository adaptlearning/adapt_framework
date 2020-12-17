import Adapt from 'core/js/adapt';

class DrawerItemView extends Backbone.View {

  className() {
    return 'drawer__menu drawer__item';
  }

  attributes() {
    return {
      role: 'list'
    };
  }

  initialize() {
    this.listenTo(Adapt, 'drawer:empty', this.remove);
    this.render();
  }

  events() {
    return {
      'click .drawer__item-btn': 'onDrawerItemClicked'
    };
  }

  render() {
    const data = this.model.toJSON();
    const template = Handlebars.templates['drawerItem'];
    $(this.el).html(template(data)).appendTo('.drawer__holder');
    return this;
  }

  onDrawerItemClicked(event) {
    event.preventDefault();
    const eventCallback = this.model.get('eventCallback');
    Adapt.trigger(eventCallback);
  }

}

DrawerItemView.type = 'drawerItem';

export default DrawerItemView;
