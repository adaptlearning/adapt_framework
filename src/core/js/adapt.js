define([
    'coreModels/lockingModel',
    'coreHelpers'
], function(lockingModel, Helpers) {

    var AdaptModel = Backbone.Model.extend({

        defaults: {
            _canScroll: true //to stop scrollTo behaviour
        },

        lockedAttributes: {
            _canScroll: false
        }

    });

    var Adapt = new AdaptModel();

    Adapt.location = {};
    Adapt.componentStore = {};
    var mappedIds = {};

    Adapt.initialize = _.once(function() {
        Backbone.history.start();
        Adapt.trigger('adapt:initialize');
    });

    Adapt.scrollTo = function(selector, settings) {
        // Get the current location - this is set in the router
        var location = (Adapt.location._contentType) ?
            Adapt.location._contentType : Adapt.location._currentLocation;
        // Trigger initial scrollTo event
        Adapt.trigger(location+':scrollTo', selector);
        //Setup duration variable passed upon arguments
        var settings = (settings || {});
        var disableScrollToAnimation = Adapt.config.has('_disableAnimation') ? Adapt.config.get('_disableAnimation') : false;
        if (disableScrollToAnimation) {
            settings.duration = 0;
        }
        else if (!settings.duration) {
            settings.duration = $.scrollTo.defaults.duration;
        }

        var navigationHeight = $(".navigation").outerHeight();

        if (!settings.offset) settings.offset = { top: -navigationHeight, left: 0 };
        if (settings.offset.top === undefined) settings.offset.top = -navigationHeight;
        if (settings.offset.left === undefined) settings.offset.left = 0;

        if (settings.offset.left === 0) settings.axis = "y";

        if (Adapt.get("_canScroll") !== false) {
        // Trigger scrollTo plugin
        $.scrollTo(selector, settings);
        }

        // Trigger an event after animation
        // 300 milliseconds added to make sure queue has finished
        _.delay(function() {
            $(selector).a11y_focus();
            Adapt.trigger(location+':scrolledTo', selector);
        }, settings.duration+300);

    }

    Adapt.navigateToElement = function(selector, settings) {
        // Allows a selector to be passed in and Adapt will navigate to this element

        // Setup settings object
        var settings = (settings || {});

        // Removes . symbol from the selector to find the model
        var currentModelId = selector.replace(/\./g, '');
        var currentModel = Adapt.findById(currentModelId);
        // Get current page to check whether this is the current page
        var currentPage = (currentModel._siblings === 'contentObjects') ? currentModel : currentModel.findAncestor('contentObjects');

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

        var shouldReplaceRoute = settings.replace || false;

        Backbone.history.navigate('#/id/' + currentPage.get('_id'), {trigger: true, replace: shouldReplaceRoute});
    }

    Adapt.register = function(name, object) {
        // Used to register components
        // Store the component view
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

        return Adapt[Adapt.mapById(id)]._byAdaptID[id][0];

    }

    return Adapt;

});
