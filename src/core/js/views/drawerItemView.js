define([
  'core/js/adapt'
], function(Adapt) {

  var DrawerItemView = Backbone.View.extend({

    className: 'drawer__menu drawer__item',

    attributes: {
      role: 'list'
    },

    initialize: function() {
      this.listenTo(Adapt, 'drawer:empty', this.remove);
      this.render();
    },

    events: {
      'click .drawer__item-btn': 'onDrawerItemClicked'
    },

    render: function() {
      var data = this.model.toJSON();
      var template = Handlebars.templates['drawerItem'];
      $(this.el).html(template(data)).appendTo('.drawer__holder');
      return this;
    },

    onDrawerItemClicked: function(event) {
      event.preventDefault();
      var eventCallback = this.model.get('eventCallback');
      Adapt.trigger(eventCallback);
    }

  }, {
    type: 'drawerItem'
  });

  return DrawerItemView;

});
