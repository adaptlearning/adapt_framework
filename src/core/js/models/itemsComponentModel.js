define([
  'core/js/models/componentModel',
  'core/js/models/itemModel'
], function(ComponentModel, ItemModel) {

  class ItemsComponentModel extends ComponentModel {

    toJSON() {
      const json = super.toJSON();
      // Make sure _items is updated from child collection
      json._items = this.getChildren().toJSON();
      return json;
    }

    init() {
      this.setUpItems();
      this.listenTo(this.getChildren(), {
        'all': this.onAll,
        'change:_isVisited': this.checkCompletionStatus
      });
    }

    /**
     * Returns a string of the model type group.
     * @returns {string}
     */
    getTypeGroup() {
      return 'itemscomponent';
    }

    setUpItems() {
      // see https://github.com/adaptlearning/adapt_framework/issues/2480
      const items = this.get('_items') || [];
      items.forEach((item, index) => (item._index = index));
      this.setChildren(new Backbone.Collection(items, { model: ItemModel }));
    }

    getItem(index) {
      return this.getChildren().findWhere({ _index: index });
    }

    getVisitedItems() {
      return this.getChildren().where({ _isVisited: true });
    }

    getActiveItems() {
      return this.getChildren().where({ _isActive: true });
    }

    getActiveItem() {
      return this.getChildren().findWhere({ _isActive: true });
    }

    areAllItemsCompleted() {
      return this.getVisitedItems().length === this.getChildren().length;
    }

    checkCompletionStatus() {
      if (!this.areAllItemsCompleted()) return;
      this.setCompletionStatus();
    }

    reset(type, force) {
      this.getChildren().each(item => item.reset());
      super.reset(type, force);
    }

    resetActiveItems() {
      this.getChildren().each(item => item.toggleActive(false));
    }

    setActiveItem(index) {
      const item = this.getItem(index);
      if (!item) return;

      const activeItem = this.getActiveItem();
      if (activeItem) activeItem.toggleActive(false);
      item.toggleActive(true);
    }

  }

  return ItemsComponentModel;

});
