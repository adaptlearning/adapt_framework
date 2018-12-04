define(function() {

  var ItemModel = Backbone.Model.extend({

    defaults: {
      _isActive: false,
      _isVisited: false
    },

    reset: function() {
      this.set({ _isActive: false, _isVisited: false });
    },

    toggleActive: function(isActive) {
      if (isActive === undefined) {
        isActive = !this.get('_isActive');
      }

      this.set('_isActive', isActive);
    },

    toggleVisited: function(isVisited) {
      if (isVisited === undefined) {
        isVisited = !this.get('_isVisited');
      }

      this.set('_isVisited', isVisited);
    }

  });

  return ItemModel;

});
