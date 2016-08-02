define([
    'core/js/adapt',
    './componentModel'
], function(Adapt, ComponentModel) {

    var ComponentItemsModel = ComponentModel.extend({

        checkIfResetOnRevisit: function() {
            var isResetOnRevisit = this.get('_isResetOnRevisit');

            // If reset is enabled set defaults
            if (isResetOnRevisit) {
                this.reset(isResetOnRevisit);

                _.each(this.getItems(), function(item) {
                    item._isVisited = false;
                });
            }
        },

        getItemsCount: function() {
            return this.getItems().length;
        },

        getItems: function() {
            return this.get('_items');
        },

        getItem: function(index) {
            return this.getItems()[index];
        },

        evaluateCompletion: function() {
            if (this.getVisitedItems().length === this.getItemsCount()) {
                this.trigger('allItems');
            } 
        },

        getVisitedItems: function() {
            return _.filter(this.getItems(), function(item) {
                return item._isVisited;
            });
        }

    });

    return ComponentItemsModel;

});
