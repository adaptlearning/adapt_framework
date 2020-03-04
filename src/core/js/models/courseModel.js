define([
  'core/js/adapt',
  'core/js/models/contentObjectModel'
], function (Adapt, ContentObjectModel) {

  class CourseModel extends ContentObjectModel {

    get _parent() {
      return null;
    }

    get _siblings() {
      return null;
    }

    get _children() {
      return 'contentObjects';
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
