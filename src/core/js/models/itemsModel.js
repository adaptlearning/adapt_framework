define([
    'core/js/adapt',
    'core/js/models/componentModel'
], function(Adapt, ComponentModel) {

    var ItemsModel = ComponentModel.extend({

        resetItems: function() {
            _.each(this.model.get('_items'), function(item) {
                item._isVisited = false;
            });
        },
        
        getItemCount: function() {
            return this.get('_items').length;
        },

        getCurrentItem: function(index) {
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
        }

    });

    return ItemsModel;

});
