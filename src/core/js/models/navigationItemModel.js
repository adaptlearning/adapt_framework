define(function () {

  class NavigationItemModel extends Backbone.Model {

    defaults() {
      return {
        _name: '',
        _layout: 'right',
        _order: 1000,
        _template: null
      };
    }

  }

  return NavigationItemModel;

});
