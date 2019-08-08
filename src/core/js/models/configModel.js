define([
  'core/js/adapt'
], function (Adapt) {

  var ConfigModel = Backbone.Model.extend({

    defaults: {
      screenSize: {
        large: 520,
        medium: 760,
        small: 900
      },
      _forceRouteLocking: false,
      _canLoadData: true,
      _disableAnimation: false
    },

    initialize: function(attrs, options) {
      this.url = options.url;
      // Fetch data & if successful trigger event to enable plugins to stop course files loading
      // Then check if course files can load
      // 'configModel:loadCourseData' event starts the core content collections and models being fetched
      this.fetch({
        success: function() {
          Adapt.trigger('offlineStorage:prepare');

          Adapt.wait.queue(function() {

            Adapt.trigger('configModel:dataLoaded');

            if (this.get('_canLoadData')) {
              Adapt.trigger('configModel:loadCourseData');
            }

          }.bind(this));
        }.bind(this),
        error: function() {
          console.log('Unable to load course/config.json');
        }
      });
    },

    loadData: function() {

    }

  });

  return ConfigModel;

});
