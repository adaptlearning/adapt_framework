define([
  'core/js/adapt'
], function(Adapt) {

  class AdaptCollection extends Backbone.Collection {

    initialize(models, options) {
      this.url = options.url;
      this.once('reset', this.loadedData, this);
      if (!this.url) return;
      this.fetch({
        reset: true,
        error: () => {
          console.error('ERROR: unable to load file ' + this.url);
        }
      });
    }

    loadedData() {
      Adapt.trigger('adaptCollection:dataLoaded');
    }

  }

  return AdaptCollection;

});
