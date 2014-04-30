/*
* Adapt
* License - https://github.com/adaptlearning/adapt_framework/blob/master/LICENSE
* Maintainers - Daryl Hedley, Fabien O'Carroll
*/

define(function(require){

    var _ = require('underscore');
    var Backbone = require('backbone');
    var Helpers = require('coreHelpers');
    
    var Adapt = {};

    _.extend(Adapt, Backbone.Events);
    
    Adapt.initialize = _.once(function() {
        Backbone.history.start();
        Adapt.trigger('adapt:initialize');
    });

    Adapt.scrollTo = function(element, duration, settings) {
        // Get the current location - this is set in the router
        var location = $('#wrapper').attr('data-location');
        // Trigger initial scrollTo event
        Adapt.trigger(location+':scrollTo', element);
        //Setup duration variable passed upon arguments
        if (!settings) {
            settings = duration;
            duration = (settings.duration) ? settings.duration : $.scrollTo.defaults.duration;
        }
        // Trigger scrollTo plugin
        $.scrollTo(element, duration, settings);
        // Trigger an event after animation
        // 300 milliseconds added to make sure queue has finished
        _.delay(function() {
            Adapt.trigger(location+':scrolledTo', element);
        }, duration+300);
        
    }
    
    Adapt.componentStore = {};
    
    Adapt.register = function(name, object) {
        
        if (Adapt.componentStore[name])
            throw Error('This component already exists in your project');
        object.template = name;
        Adapt.componentStore[name] = object;
        
    }
    
    return Adapt;
    
});
