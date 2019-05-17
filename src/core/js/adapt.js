define([
    'core/js/wait',
    'core/js/models/lockingModel'
], function(Wait) {

    var Adapt = Backbone.Model.extend({

        loadScript: window.__loadScript,
        location: {},
        componentStore: {},

        defaults: {
            _canScroll: true, //to stop scrollTo behaviour,
            _outstandingCompletionChecks: 0,
            _pluginWaitCount:0,
            _isStarted: false
        },

        lockedAttributes: {
            _canScroll: false
        },

        init: function() {
            //wait until no more completion checking
            this.deferUntilCompletionChecked(function() {

                //start adapt in a full restored state
                this.trigger('adapt:start');

                if (!Backbone.History.started) {
                    Backbone.history.start();
                }

                this.set('_isStarted', true);

                this.trigger('adapt:initialize');

            }.bind(this));
        },

        initialize: function () {
            this.setupWait();
        },

        /**
         * call when entering an asynchronous completion check
         */
        checkingCompletion: function() {
            var outstandingChecks = this.get('_outstandingCompletionChecks');
            this.set('_outstandingCompletionChecks', ++outstandingChecks);
        },

        /**
         * call when exiting an asynchronous completion check
         */
        checkedCompletion: function() {
            var outstandingChecks = this.get('_outstandingCompletionChecks');
            this.set('_outstandingCompletionChecks', --outstandingChecks);
        },

        /**
         * wait until there are no outstanding completion checks
         * @param {Function} callback Function to be called after all completion checks have been completed
         */
        deferUntilCompletionChecked: function(callback) {

            if (this.get('_outstandingCompletionChecks') === 0) return callback();

            var checkIfAnyChecksOutstanding = function(model, outstandingChecks) {
                if (outstandingChecks !== 0) return;

                this.off('change:_outstandingCompletionChecks', checkIfAnyChecksOutstanding);

                callback();
            };

            this.on('change:_outstandingCompletionChecks', checkIfAnyChecksOutstanding);

        },

        setupWait: function() {

            this.wait = new Wait();

            // Setup legacy events and handlers
            var beginWait = function () {
                this.log.warn("DEPRECATED - Use Adapt.wait.begin() as Adapt.trigger('plugin:beginWait') may be removed in the future");
                this.wait.begin();
            }.bind(this);

            var endWait = function() {
                this.log.warn("DEPRECATED - Use Adapt.wait.end() as Adapt.trigger('plugin:endWait') may be removed in the future");
                this.wait.end();
            }.bind(this);

            var ready = function() {

                if (this.wait.isWaiting()) {
                    return;
                }

                var isEventListening = (this._events['plugins:ready']);
                if (!isEventListening) {
                    return;
                }

                this.log.warn("DEPRECATED - Use Adapt.wait.queue(callback) as Adapt.on('plugins:ready', callback) may be removed in the future");
                this.trigger('plugins:ready');

            }.bind(this);

            this.listenTo(this.wait, 'ready', ready);
            this.listenTo(this, {
                'plugin:beginWait': beginWait,
                'plugin:endWait': endWait
            });

        },

        isWaitingForPlugins: function() {
            this.log.warn("DEPRECATED - Use Adapt.wait.isWaiting() as Adapt.isWaitingForPlugins() may be removed in the future");
            return this.wait.isWaiting();
        },

        checkPluginsReady: function() {
            this.log.warn("DEPRECATED - Use Adapt.wait.isWaiting() as Adapt.checkPluginsReady() may be removed in the future");
            if (this.isWaitingForPlugins()) {
                return;
            }
            this.trigger('plugins:ready');
        },

        /**
         * Allows a selector to be passed in and Adapt will navigate to this element
         * @param {string} selector CSS selector of the Adapt element you want to navigate to e.g. `".co-05"`
         * @param {object} [settings] The settings for the `$.scrollTo` function (See https://github.com/flesler/jquery.scrollTo#settings).
         * You may also include a `replace` property that you can set to `true` if you want to update the URL without creating an entry in the browser's history.
         */
        navigateToElement: function(selector, settings) {
            settings = (settings || {});

            // Removes . symbol from the selector to find the model
            var currentModelId = selector.replace(/\./g, '');
            var currentModel = this.findById(currentModelId);
            // Get current page to check whether this is the current page
            var currentPage = (currentModel._siblings === 'contentObjects') ? currentModel : currentModel.findAncestor('contentObjects');

            // If current page - scrollTo element
            if (currentPage.get('_id') === this.location._currentId) {
            return this.scrollTo(selector, settings);
            }

            // If the element is on another page navigate and wait until pageView:ready is fired
            // Then scrollTo element
            this.once('pageView:ready', _.debounce(function() {
                this.router.set('_shouldNavigateFocus', true);
                this.scrollTo(selector, settings);
            }.bind(this), 1));

            var shouldReplaceRoute = settings.replace || false;

            this.router.set('_shouldNavigateFocus', false);
            Backbone.history.navigate('#/id/' + currentPage.get('_id'), {trigger: true, replace: shouldReplaceRoute});
        },

        /**
         * Used to register components with the Adapt 'component store'
         * @param {string} name The name of the component to be registered
         * @param {object} object Object containing properties `model` and `view` or (legacy) an object representing the view
         */
        register: function(name, object) {
            if (this.componentStore[name]) {
                throw Error('The component "' + name + '" already exists in your project');
            }

            if (object.view) {
                //use view+model object
                if(!object.view.template) object.view.template = name;
            } else {
                //use view object
                if(!object.template) object.template = name;
            }

            this.componentStore[name] = object;

            return object;
        },

        /**
         * Fetches a component view class from the componentStore. For a usage example, see either HotGraphic or Narrative
         * @param {string} name The name of the componentView you want to fetch e.g. `"hotgraphic"`
         * @returns {ComponentView} Reference to the view class
         */
        getViewClass: function(name) {
            var object = this.componentStore[name];
            if (!object) {
                throw Error('The component "' + name + '" doesn\'t exist in your project');
            }
            return object.view || object;
        },

        /**
         * Looks up which collection a model belongs to
         * @param {string} id The id of the item you want to look up e.g. `"co-05"`
         * @return {string} One of the following (or `undefined` if not found):
         * - "course"
         * - "contentObjects"
         * - "blocks"
         * - "articles"
         * - "components"
         */
        mapById: function(id) {
            return this.data.mapById(id);
        },

        /**
         * Looks up a model by its `_id` property
         * @param {string} id The id of the item e.g. "co-05"
         * @return {Backbone.Model}
         */
        findById: function(id) {
            return this.data.findById(id);
        },

        /**
         * Relative strings describe the number and type of hops in the model hierarchy
         * @param {string} relativeString "@component +1" means to move one component forward from the current model
         * This function would return the following:
         * {
         *     type: "component",
         *     offset: 1
         * }
         * Trickle uses this function to determine where it should scrollTo after it unlocks
         */
        parseRelativeString: function(relativeString) {
            if (relativeString[0] === '@') {
                relativeString = relativeString.substr(1);
            }

            var type = relativeString.match(/(component|block|article|page|menu)/);
            if (!type) {
                this.log.error('Adapt.parseRelativeString() could not match relative type', relativeString);
                return;
            }
            type = type[0];

            var offset = parseInt(relativeString.substr(type.length).trim()||0);
            if (isNaN(offset)) {
                this.log.error('Adapt.parseRelativeString() could not parse relative offset', relativeString);
                return;
            }

            return {
                type: type,
                offset: offset
            };

        },

        remove: function() {
            this.trigger('preRemove');
            this.trigger('remove');
            _.defer(function() {
                this.trigger('postRemove');
            }.bind(this));
        }

    });

    return new Adapt();
});
