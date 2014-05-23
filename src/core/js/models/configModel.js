/*
* Adapt
* License - https://github.com/adaptlearning/adapt_framework/blob/master/LICENSE
* Maintainers - Brian Quinn, Daryl Hedley <darylhedley@gmail.com>
*/

define(function(require) {

    var Backbone = require('backbone');
    var Adapt = require('coreJS/adapt');

    var ConfigModel = Backbone.Model.extend({

        defaults: {
            screenSize : {
                small:520,
                medium:760,
                large:1024
            },
            _canLoadData:true
        },

        lockedAttributes: {
            _canLoadData: {}
        },

        initialize: function(attrs, options) {
            // Fetch data & if successful trigger event to enable plugins to stop course files loading
            // Then check if course files can load
            // 'configModel:loadCourseData' event starts the core content collections and models being fetched
            this.fetch({
                success: _.bind(function() {
                    Adapt.trigger('configModel:dataLoaded');
                    if (this.get('_canLoadData')) {
                        Adapt.trigger('configModel:loadCourseData');
                    }
                }, this),
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