define([
  'core/js/models/componentModel',
  'core/js/models/itemModel'
], function(ComponentModel, ItemModel) {

  var ItemsComponentModel = ComponentModel.extend({

    toJSON: function() {
      var json = _.clone(this.attributes);
      json._items = this.get('_children').toJSON();

      return json;
    },

    init: function() {
      this.setUpItems();

      this.listenTo(this.get('_children'), {
        'all': this.onAll,
        'change:_isVisited': this.checkCompletionStatus
      });
    },

    setUpItems: function() {
      var items = this.get('_items') || []; // see https://github.com/adaptlearning/adapt_framework/issues/2480
      items.forEach(function(item, index) {
        item._index = index;
      });

      this.set('_children', new Backbone.Collection(items, { model: ItemModel }));
    },

    getItem: function(index) {
      return this.get('_children').findWhere({ _index: index });
    },

    getVisitedItems: function() {
      return this.get('_children').where({ _isVisited: true });
    },

    getActiveItems: function() {
      return this.get('_children').where({ _isActive: true });
    },

    getActiveItem: function() {
      return this.get('_children').findWhere({ _isActive: true });
    },

    areAllItemsCompleted: function() {
      return this.getVisitedItems().length === this.get('_children').length;
    },

    checkCompletionStatus: function() {
      if (this.areAllItemsCompleted()) {
        this.setCompletionStatus();
      }
    },

    reset: function(type, force) {
      this.get('_children').each(function(item) { item.reset(); });

      ComponentModel.prototype.reset.call(this, type, force);
    },

    resetActiveItems: function() {
      this.get('_children').each(function(item) { item.toggleActive(false); });
    },

    setActiveItem: function(index) {
      var activeItem = this.getActiveItem();
      if (activeItem) activeItem.toggleActive(false);
      this.getItem(index).toggleActive(true);
    }

  });

  return ItemsComponentModel;

});
