import AdaptCollection from 'core/js/collections/adaptCollection';

export default class AdaptSubsetCollection extends AdaptCollection {

  initialize(models, options) {
    super.initialize(models, options);
    this.parent = options.parent;
    this.listenTo(this.parent, 'reset', this.loadSubset);
  }

  loadSubset() {
    this.set(this.parent.filter(model => model instanceof this.model));
    this._byAdaptID = this.groupBy('_id');
  }

}
