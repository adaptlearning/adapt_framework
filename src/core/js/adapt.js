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

        Adapt.trigger(location+':scrollTo', selector);

        var settings = (settings || {});
        if (!settings.duration) {
            settings.duration = $.scrollTo.defaults.duration;
        }

        var navigationHeight = $(".navigation").outerHeight();

        if (!settings.offset) settings.offset = { top: -navigationHeight, left: 0 };
        if (settings.offset.top === undefined) settings.offset.top = -navigationHeight;
        if (settings.offset.left === undefined) settings.offset.left = 0;

        if (settings.offset.left === 0) settings.axis = "y";

        $.scrollTo(selector, settings);

        // Trigger an event after animation
        _.delay(function() {
            $(selector).a11y_focus();
            Adapt.trigger(location+':scrolledTo', selector);
        // 300 milliseconds added to make sure queue has finished
        }, settings.duration+300);
    }

    // Allows a selector to be passed in and Adapt will navigate to this element
    Adapt.navigateToElement = function(selector, settings) {
        var settings = (settings || {});

        // Removes . symbol from the selector to find the model
        var currentModelId = selector.replace(/\./g, '');
        var currentModel = Adapt.findById(currentModelId);
        var currentPage = (currentModel._siblings === 'contentObjects') ? currentModel : currentModel.findAncestor('contentObjects');

        if (currentPage.get('_id') === Adapt.location._currentId) {
           return Adapt.scrollTo(selector, settings);
        }

        // navigate & wait until pageView:ready, then scrollTo element
        Adapt.once('pageView:ready', function() {
            _.defer(function() {
                Adapt.scrollTo(selector, settings)
            })
        });

        Backbone.history.navigate('#/id/' + currentPage.get('_id'), {trigger: true});
    }

    // Used to register components
    Adapt.register = function(name, object) {
        console.log(name, object.template);
        if (Adapt.componentStore[name])
            throw Error('This component already exists in your project');
        if(!object.template) object.template = name;
        Adapt.componentStore[name] = object;
    }

    // Used to map ids to collections
    Adapt.setupMapping = function() {
        // Setup course Id
        mappedIds[Adapt.course.get('_id')] = "course";

        // Setup each collection
        var collections = ["contentObjects", "articles", "blocks", "components"];

        for (var i = 0, len = collections.length; i < len; i++) {
            var collection = collections[i];
            var models = Adapt[collection].models;
            for (var j = 0, lenj = models.length; j < lenj; j++) {
                var model = models[j];
                mappedIds[model.get('_id')] = collection;
            }
        }
    }

    // Returns collection name that contains this models Id
    Adapt.mapById = function(id) {
        return mappedIds[id];
    }

    // Return a model
    Adapt.findById = function(id) {
        if (id === Adapt.course.get('_id')) {
            return Adapt.course;
        }
        return Adapt[Adapt.mapById(id)]._byAdaptID[id][0];
    }

    return Adapt;
});
