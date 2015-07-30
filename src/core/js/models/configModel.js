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

        initialize: function(attrs, options) {
            this.url = options.url;
            // Fetch data & if successful trigger event to enable plugins to stop course files loading
            // Then check if course files can load
            // 'configModel:loadCourseData' event starts the core content collections and models being fetched
            this.fetch({
                success: _.bind(function() {
                    Adapt.trigger('configModel:dataLoaded');
                    if (this.get('_canLoadData')) {
                        Adapt.trigger('configModel:loadCourseData');
                    }
                    if(this.get('_defaultDirection')=='rtl'){//We're going to use rtl style
                    	$('html').addClass('dir-rtl');
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
