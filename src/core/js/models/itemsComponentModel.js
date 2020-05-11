define([
  'core/js/models/componentModel',
  'core/js/models/itemModel'
], function(ComponentModel, ItemModel) {

  class ItemsComponentModel extends ComponentModel {

    toJSON() {
      const json = _.clone(this.attributes);
      json._items = this.get('_children').toJSON();
      return json;
    }

    init() {
      this.setUpItems();
      this.listenTo(this.get('_children'), {
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
      this.set('_children', new Backbone.Collection(items, { model: ItemModel }));
    }

    getItem(index) {
      return this.get('_children').findWhere({ _index: index });
    }

    getVisitedItems() {
      return this.get('_children').where({ _isVisited: true });
    }

    getActiveItems() {
      return this.get('_children').where({ _isActive: true });
    }

    getActiveItem() {
      return this.get('_children').findWhere({ _isActive: true });
    }

    areAllItemsCompleted() {
      return this.getVisitedItems().length === this.get('_children').length;
    }

    checkCompletionStatus() {
      if (!this.areAllItemsCompleted()) return;
      this.setCompletionStatus();
    }

    reset(type, force) {
      this.get('_children').each(item => item.reset());
      super.reset(type, force);
    }

    resetActiveItems() {
      this.get('_children').each(item => item.toggleActive(false));
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
