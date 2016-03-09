define([
    "core/js/adapt",
    'DOMDiffer'
], function(Adapt, DOMDiffer) {

    // Abstract view - Do not instantiate directly, please extend first

    var ddInstance, ddOptions, ddTemp;
    var trim_regex = /^\s+|\s+$/g;

    var DiffView = Backbone.View.extend({

        // Default view Properties
        isRemoved: false,
        isReady: false,
        hasRendered: false,
        parentView: undefined,

        // Developer configurable properties
        renderOnInitialize: true,
        renderAttributes: undefined,

        normalizeClassNames: function normalizeClassNames(classNames) {

            switch (typeof classNames) {
            case "string":
                // Turn string into array
                classNames = classNames.split(" ");
            }

            if (classNames instanceof Array) {
                // Join and resplit as some items make contain spaces
                classNames = classNames.join(" ").split(" ");
                // Remove all empty classNames
                classNames = _.filter(classNames, function(name) {
                    if (!name) return false;
                    return true;
                });
                //Trim white-space from each item
                for (var i = 0, l = classNames.length; i < l; i++) {
                    classNames[i] = classNames[i].replace(trim_regex, "");
                }
                //Concatenate into a single string
                return classNames.join(" ");
            }

            return "";
        },

        initialize: function initialize(options){
            options = options || {};

            // Debouce render so that many variable changes can be lumped into a single redraw
            this.render = _.debounce(_.bind(this.render, this), 17);

            // Create a state model to manage view-only states
            this.state = options.state || new Backbone.Model({});

            // Backwards compatible _isReady setting
            if (this.model && this.model.set) {
                this.model.set("_isReady", false);
            }

            // Register view with parent if available
            this.parentView = options.parentView;
            if (this.parentView && this.parentView.addChildView) {
                this.parentView.addChildView(this);
            }

            this.initializeEventListeners();

            this.postInitialize();
            
            // Selectively allow view to render on initialization
            if (this.renderOnInitialize) this.render();
        },        

        initializeEventListeners: function initializeEventListeners() {

            // Listen to global Adapt "remove" event
            this.listenToOnce(Adapt, "remove", this.onRemove);

            // Listen to parentView "remove" event if available
            if (this.parentView && this.parentView.trigger) {
                // Cascade parent detach
                this.listenToOnce(this.parentView, "detach", this.onParentDetach);
            }

            if (this.model && this.model.trigger) {
                // If this.model is a Backbone.Model attach a model change event listener to rerender
                this.listenTo(this.model, "change", this.onChangeRenderFilter, this);
            }

            // Listen to state change events to rerender
            this.listenTo(this.state, "change", this.onChangeRenderFilter, this);

        },

        // Override with post initialization code
        postInitialize: function postInitialize() {},

        // Override with pre rendering code
        preRender: function preRender() {},

        render: function render() {

            // Do not allow render if the view has been removed
            if (this.isRemoved) return;

            this.trigger("preRender", this);
            this.preRender();

            var template = Handlebars.templates[this.constructor.template];
            var renderedHTML = template(this.getRenderData());;

            if (this.hasRendered) {

                // Push renderedHTML into temporary DOM node
                ddTemp.innerHTML = renderedHTML;

                //var startTime = (new Date()).getTime();

                // Update this.el from ddTemp
                var diff = ddInstance.nodeUpdateNode(this.el, ddTemp, {
                    ignoreContainer: true,
                    returnDiff: true
                });

                //var totalTime = (new Date()).getTime() - startTime;

                //console.log("diffing", totalTime+"ms", diff.length + "changes");

            } else {

                 // Push renderedHTML straight into DOM
                this.el.innerHTML = renderedHTML;

                this.hasRendered = true;
            }

            _.defer(_.bind(function() {
                // Don't continue after remove
                if (this.isRemoved) return;
                
                this.postRender();
                this.trigger("postRender", this);

            }, this));


        },

        getRenderData: function getRenderData() {
            // Combine all view and state data into template parameters

            var state;
            var model;
            var collection;

            // Handle backbone models or flat json objects
            if (this.model && this.model.toJSON) {
                model = this.model.toJSON();
            } else {
                model = this.model;
            }
            if (this.collection && this.collection.toJSON) {
                collection = this.collection.toJSON();
            } else {
                collection = this.collection;
            }
            if (this.state && this.state.toJSON) {
                state = this.state.toJSON();
            } else {
                state = this.state;
            }

            // Create a handlebars context similar to the usual context
            // this.state take precedence over this.model
            var rtn = _.extend({}, state, model, state);
            
            // Extend tempalte context with separated properties
            rtn.state = state;
            rtn.model = model;
            rtn.collection = collection;

            // Extend template context with _globals
            rtn._globals = Adapt.course.get('_globals');

            return rtn;
        },

        // Used to limited the rerenders based on model and state change events
        onChangeRenderFilter: function onChangeRenderFilter(model, value) {

            // If there are no renderAttributes the render always
            if (!this.renderAttributes) return this.render();

            // Check renderAttributes
            var shouldRerender = false;
            switch (typeof this.renderAttributes) {
            case "object":
                var changedKeys = _.keys(model.changed);
                shouldRerender =_.some(changedKeys, _.bind(function(key) {
                    return _.contains(this.renderAttributes, key);
                }, this));
                break;
            case "function":
                shouldRerender = this.renderAttributes(model, value);
                break;
            default:
                shouldRerender = true;
            }

            if (shouldRerender) return this.render();

        },

        // Override with post render code
        postRender: function postRender() {},

        // Override to handle child views
        registerChildView: function registerChildView(view) {
            throw "This view is not designed to handle children";
        },

        setReadyStatus: function setReadyStatus() {
            if (!this.isReady) {
                _.defer(_.bind(function() {
                    // Backwards compatible _isReady setting
                    if (this.model && this.model.set) {
                        this.model.set("_isReady", true);
                    }
                    this.trigger("ready", this);
                }, this));
            }
            this.isReady = true;
        },

        // Handle global Adapt "remove" events
        onRemove: function onRemove() {
            if (this.isRemoved) return;
            
            this.remove();
        },

        // Normal remove this.el from document
        remove: function remove() {
            if (this.isRemoved) return;

            this.trigger("remove", this);
            this.$el.remove();
            this.detach();
        },

        // Empty this.el if the container needs to stay
        empty: function empty() {
            if (this.isRemoved) return;

            this.trigger("empty", this);
            this.$el.empty();
            this.detach();
        },

        // Handle parent detach events
        onParentDetach: function onParentDetach() {
            if (this.isRemoved) return;

            this.detach();
        },

        // Detach the view from the dom but leave the dom untouched
        detach: function detach() {
            if (this.isRemoved) return;

            this.trigger("detach", this);
            this.isRemoved = true;
            this.undelegateEvents();
            this.stopListening();
            this.el = undefined;
            this.$el = undefined;
            this.state = undefined;
            this.model = undefined;
            this.collection = undefined;
            this.parentView = undefined;
        }

    });

    // Setup DOMDiffer
    ddOptions = {

        // Do not diff children inside elements with attr <tagName view-container="true"></tagName>
        ignoreSubTreesWithAttributes: [
            "view-container"
        ],

        // Ignore accessibility attributes on rerender
        ignoreAttributes: [
            "tabindex",
            "aria-hidden"
        ],

        ignoreAttributesWithPrefix: []

    };

    Adapt.on("app:dataReady", function() {
        //add ie8 special attributes
        if ($("html").is(".ie8")) {
            ddOptions.ignoreAttributesWithPrefix.push("jQuery");
            ddOptions.ignoreAttributesWithPrefix.push("sizzle");
        }
    });

    ddInstance = new DOMDiffer(ddOptions);

    // Create a temporary DOM node in which to render templates for diffing
    ddTemp = document.createElement("div");

    return DiffView;

});
