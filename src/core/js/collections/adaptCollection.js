define([
  'core/js/adapt'
], function(Adapt) {

  class AdaptCollection extends Backbone.Collection {

    initialize(models, options) {
      this.once('reset', this.loadedData, this);
    }

    loadedData() {
      Adapt.trigger('adaptCollection:dataLoaded');
    }

  }

  return AdaptCollection;

});
