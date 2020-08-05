define(function () {

  class NavigationItemModel extends Backbone.Model {

    defaults() {
      return {
        _name: '',
        _order: -1,
        _template: null
      };
    }

  }

  return NavigationItemModel;

});
