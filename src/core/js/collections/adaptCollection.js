import Adapt from 'core/js/adapt';

export default class AdaptCollection extends Backbone.Collection {

  initialize(models, options) {
    this.once('reset', this.loadedData, this);
  }

  loadedData() {
    Adapt.trigger('adaptCollection:dataLoaded');
  }

}
