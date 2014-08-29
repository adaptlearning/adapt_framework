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
    var mappedIds = {};

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

    Adapt.navigateToElement = function(selector, settings) {
        // Allows a selector to be passed in and Adapt will navigate to this element

        // Setup settings object
        var settings = (settings || {});

        // Removes . symbol from the selector to find the model
        var currentModelId = selector.replace(/\./g, '');
        var currentModel = Adapt[Adapt.mapById(currentModelId)].findWhere({_id: currentModelId});
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
        // Used to register components
        // Store the component view
        if (Adapt.componentStore[name])
            throw Error('This component already exists in your project');
        object.template = name;
        Adapt.componentStore[name] = object;
        
    }

    // Used to map ids to collections
    Adapt.setupMapping = function() {
        
        // Setup course Id
        mappedIds[Adapt.course.get('_id')] = "course";

        // Setup each collection
        var collections = ["contentObjects", "articles", "blocks", "components"];

        _.each(collections, function(collection) {

            // Go through each collection and store id
            Adapt[collection].each(function(model) {

                mappedIds[model.get('_id')] = collection;

            });

        });

    }

    Adapt.mapById = function(id) {
        // Returns collection name that contains this models Id
        return mappedIds[id];

    }

    Adapt.findById = function(id) {

        // Return a model
        // Checks if the Id passed in is the course Id
        if (id === Adapt.course.get('_id')) {
            return Adapt.course;
        }

        return Adapt[Adapt.mapById(id)].findWhere({_id: id});

    }
    
    return Adapt;
    
});
