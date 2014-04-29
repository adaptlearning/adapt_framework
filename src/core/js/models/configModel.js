/*
* Adapt
* License - https://github.com/adaptlearning/adapt_framework/blob/master/LICENSE
* Maintainers - Brian Quinn
*/

define(function(require) {

    var Backbone = require('backbone');
    var Adapt = require('coreJS/adapt');

    var ConfigModel = Backbone.Model.extend({
        defaults: {
            "_defaultLanguage": "en",
            "screenSize" : 
                {"small":520,"medium":760,"large":1024}
        },

        initialize: function(options) {
            this.url = options.url;
            this.fetch({
                success: function() {
                    Adapt.trigger('configModel:dataLoaded');
                },
                error: function() {
                    console.log('Unable to load course/config.json');
                }
            });
        }
    });
   
   return ConfigModel; 
});