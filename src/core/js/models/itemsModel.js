define([
    'core/js/adapt',
    'core/js/models/componentModel'
], function(Adapt, ComponentModel) {

    var ItemsModel = ComponentModel.extend({

        reset: function(type, force) {
            this.resetItems();
            ComponentModel.prototype.reset.call(this, type, force);
        },

        resetItems: function() {
            _.each(this.get('_items'), function(item) {
                item._isVisited = false;
                item._isActive = false;
            });
        },
        
        getItemCount: function() {
            return this.get('_items').length;
        },

        getItem: function(index) {
            return this.get('_items')[index];
        },

        getVisitedItems: function() {
            return _.filter(this.get('_items'), function(item) {
                return item._isVisited;
            });
        },

        setItemVisited: function(index) {
            var item = this.get('_items')[index];
            if (item) {
                item._isVisited = true;
            }
        },

        areAllIItemsCompleted: function() {
            return (this.getVisitedItems().length === this.getItemCount());
        },

        checkCompletionStatus: function() {
            if (this.areAllIItemsCompleted()) {
                this.setCompletionStatus();
            }
        },

        resetActiveItems: function(trigger) {
            var items = this.get('_items');

            _.each(items, function(item) {
                item._isActive = false;
            });

            if (trigger !== false) {
                this.trigger('change:_items:_isActive', this, items);
            }
        },

        getActiveItems: function() {
            return _.filter(this.get('_items'), function(item) {
                return item._isActive;
            });
        },
        
        getFirstActiveItem: function() {
            return this.getActiveItems()[0];
        },
        
        getActiveItemsCount: function() {
            return this.getActiveItems().length;
        },
        
        getActiveItemsIndexes: function() {
            var indexes = [];
            var items = this.get('_items');
            
            for (var i = 0, l = items.length; i < l; i++) {
                if (items[i]._isActive) {
                    indexes.push(i); 
                }
            }

            return indexes;
        },

        getFirstActiveItemIndex: function() {
            return this.getActiveItemsIndexes()[0];
        },

        setItemActive: function(index, trigger) {
            var items = this.get('_items');
            var item = items[index];
            
            if (item === undefined) return false;

            item._isActive = true;
            if (trigger !== false) {
                this.trigger('change:_items:_isActive', this, items);
            }
            
            return item;
        },
        
        setItemInactive: function(index, trigger) {
            var items = this.get('_items');
            var item = items[index];
            
            if (item === undefined) return false;

            item._isActive = false;
            if (trigger !== false) {
                this.trigger('change:_items:_isActive', this, items);
            }

            return item;
        }

    });

    return ItemsModel;

});
