define([
  'core/js/adapt',
  'core/js/logging'
], function (Adapt) {

  var BuildModel = Backbone.Model.extend({

    defaults: {
      jsonext: 'json'
    },

    initialize: function(attrs, options) {
      this.url = options.url;
      // Fetch data & if successful trigger event to enable plugins to stop course files loading
      // Then check if course files can load
      // 'configModel:loadCourseData' event starts the core content collections and models being fetched
      this.fetch({
        success: _.bind(function() {
          this.isLoaded = true;
          Adapt.trigger('buildModel:dataLoaded');
        }, this),
        error: function() {
          console.log('Unable to load adapt/js/build.js');
          Adapt.trigger('buildModel:dataLoaded');
        }
      });
    }

  });

  return BuildModel;

});
