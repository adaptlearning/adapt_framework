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
            });
        },
        
        getItemCount: function() {
            return this.get('_items').length;
        },

        getItemAtIndex: function(index) {
            return this.get('_items')[index];
        },

        getVisitedItems: function() {
            return _.filter(this.get('_items'), function(item) {
                return item._isVisited;
            });
        },

        setItemAsVisited: function(index) {
            var item = this.get('_items')[index];
            item._isVisited = true;
        },

        getCompletionStatus: function() {
            return (this.getVisitedItems().length == this.get('_items').length);
        },

        checkCompletionStatus: function() {
            if (this.getCompletionStatus()) {
                this.setCompletionStatus();
            }
        }

    });

    return ItemsModel;

});
