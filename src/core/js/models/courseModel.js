define([
  'core/js/adapt',
  'core/js/models/adaptModel'
], function (Adapt, AdaptModel) {

  class CourseModel extends AdaptModel {

    constructor(...args) {
      super(...args);
      this._children = 'contentObjects';
    }

    initialize(attrs, options) {
      super.initialize(arguments);
      Adapt.trigger('courseModel:dataLoading');

      this.url = options.url;

      this.on('sync', this.loadedData, this);
      if (this.url) {
        this.fetch({
          error: (model, xhr, options) => {
            console.error('ERROR: unable to load file ' + this.url);
          }
        });
      }
    }

    loadedData() {
      Adapt.trigger('courseModel:dataLoaded');
    }

  };

  return CourseModel;

});
