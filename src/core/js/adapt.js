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
    Adapt.location = {};
    Adapt.componentStore = {};

    _.extend(Adapt, Backbone.Events);
    
    Adapt.initialize = _.once(function() {
        Backbone.history.start();
        Adapt.trigger('adapt:initialize');
    });

    Adapt.scrollTo = function(selector, settings) {
        // Get the current location - this is set in the router
        var location = (Adapt.location._contentType) ? 
            Adapt.location._contentType : Adapt.location.currentLocation;
        // Trigger initial scrollTo event
        Adapt.trigger(location+':scrollTo', selector);
        //Setup duration variable passed upon arguments
        var settings = (settings || {});
        if (!settings.duration) {
            settings.duration = $.scrollTo.defaults.duration;
        }
        // Trigger scrollTo plugin
        $.scrollTo(selector, settings);
        // Trigger an event after animation
        // 300 milliseconds added to make sure queue has finished
        _.delay(function() {
            Adapt.trigger(location+':scrolledTo', selector);
        }, settings.duration+300);
        
    }

    Adapt.navigateToElement = function(selector, type, settings) {
        // Allows a selector to be passed in and Adapt will navigate to this element

        // Setup settings object
        var settings = (settings || {});

        // Removes . symbol from the selector to find the model
        var currentModelId = selector.replace(/\./g, '');
        var currentModel = Adapt[type].findWhere({_id: currentModelId});
        // Get current page to check whether this is the current page
        var currentPage = currentModel.findAncestor('contentObjects');

        // If current page - scrollTo element
        if (currentPage.get('_id') === Adapt.location._currentId) {
           return Adapt.scrollTo(selector, settings);
        }

        // If the element is on another page navigate and wait until pageView:ready is fired
        // Then scrollTo element
        Adapt.once('pageView:ready', function() {
            _.defer(function() {
                Adapt.scrollTo(selector, settings)
            })
        });

        Backbone.history.navigate('#/id/' + currentPage.get('_id'), {trigger: true});

    }
    
    Adapt.register = function(name, object) {
        
        if (Adapt.componentStore[name])
            throw Error('This component already exists in your project');
        object.template = name;
        Adapt.componentStore[name] = object;
        
    }
    
    return Adapt;
    
});
