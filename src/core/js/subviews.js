define([
    'core/js/adapt',
    'handlebars',
    './views/subView'
], function(Adapt, Handlebars, SubView) {

    /**
     * Represents a handlebars subview statement and associated subview instance.
     * @param  {Object} context Handlebars defined subview name and model id
     */
    var Invocation = Backbone.Controller.extend({

        name: null,
        id: null,
        model: null,
        uid: null,
        instance: null,

        /**
         * @param  {Object} context Handlebars statement details
         */
        initialize: function(context) {
            if (!context.name) {
                Adapt.log.warn('SubViews: No name specified.');
            }
            if (!context.id && !context.data) {
                Adapt.log.warn('SubViews: No id or data specified for name="'+context.name+'"');
            }

            this.name = context.name || null;
            this.id = context.id || null;
            this.uid = Invocation.getNextId();
            if (this.id) {
                this.model = Adapt.findById(context.id);
            }

            // Find the original model by id if specified in the data
            if (!this.model && context.data && context.data._id) {
                this.model = Adapt.findById(context.data._id);
            }

            if (this.model) return;
            
            // If no model was found.
            Adapt.log.warn('SubView: No model found for name="'+this.name+'" id="'+this.id+'"');
        },

        /**
         * Equality test for invocation instances
         * @param  {Invocation}  invocation Compare with
         * @return {Boolean}
         */
        isEqual: function(invocation) {
            if (this.name !== invocation.name) return false;
            if (this.id !== invocation.id) return false;
            if (this.model !== invocation.model) return false;
            return true;
        },

        /**
         * Returns boolean true if this invocation has instantiated a subview
         * @return {Boolean}  Whether this invocation has instantiated a subview or not
         */
        hasInstance: function() {
            return Boolean(this.instance);
        },

        /**
         * Create an instance of the named subview
         * @return {Object}   an instance of the named subview
         */
        createInstance: function() {
            if (!this.model) {
                return this;
            }

            var SubViewClass = Adapt.subviews.get(this.name);
            if (!SubViewClass) {
                this.instance = null;
                return this;
            }

            var instance = new SubViewClass({
                attributes: {
                    "data-adapt-subview": this.uid
                },
                model: this.model
            });

            this.instance = instance;
            return this;
        },

        destroy: function() {
            if (this.hasInstance()) {
                // Make sure to unset instance as remove causes circular clearup
                var instance = this.instance;
                this.instance = null;
                instance.remove();
            }
            this.name = null;
            this.id = null;
            this.data = null;
            this.uid = null;
        }

    }, {

        uid: 0,

        /**
         * Generate a unique id for each invocation. This is used to match
         * placeholders with subviews.
         * @return {Number}
         */
        getNextId: function() {
            if (this.uid >= Number.MAX_SAFE_INTEGER) {
                this.uid = 0;
            } else {
                this.uid++
            }
            return this.uid;
        }

    });

    /**
     * Represents the handlebars subview statements from the current Adapt location.
     */
    var Invocations = Backbone.Controller.extend({

        items: null,

        initialize: function() {
            this.items = [];
            this.updatePlaceholders = _.debounce(this.updatePlaceholders, 1);
            this.addHelper();
            this.addMutationObserver();
            this.listenTo(Adapt, {
                "remove": this.destroy,
                "subview:remove": this.onRemoveSubView
            });
        },

        /**
         * Add the subview helper for handlebars
         *
         * Lookup model by id
         * {{subview name="menu:progress" id="co-200"}}
         *
         * Lookup the model by object id
         * {{subview name="menu:progress" model={ _id:"co-200" } }}
         *
         * Pass context through and lookup { _id: "co-200" } from there
         * {{subview name="menu:progress"}}
         *
         * Note: A view must have a model id which is available through Adapt.findById
         */
        addHelper: function() {
            Handlebars.registerHelper('subview', function(options) {
                // Create an invocation for a subview
                var context = {
                    name: options.hash.name,
                    id: options.hash.id,
                    data: options.hash.id ? null : options.hash.model || this,
                };
                var invocation = Adapt.subviews.invocations.create(context);
                var html = '';
                if (invocation.hasInstance()) {
                    // Generate a subview placeholder
                    html = invocation.instance.getOuterHTML();
                }
                return new Handlebars.SafeString(html);
            });
        },

        /**
         * Listen for new elements added to the document.body. Trigger to update
         * placeholders with subviews if found.
         */
        addMutationObserver: function() {
            var observer = new MutationObserver(function(mutations) {
                // Find subview placeholders
                var hasPlaceholders = false;
                _.find(mutations, function(mutation) {
                    if (mutation.type !== "childList") return;
                    if (!mutation.addedNodes || !mutation.addedNodes.length) return;
                    var $newSeats = $(mutation.addedNodes).find("[data-adapt-subview]");
                    if (!$newSeats.length) return;
                    hasPlaceholders = true;
                    return true;
                });
                if (!hasPlaceholders) return;
                this.updatePlaceholders();
            }.bind(this));
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        },

        /**
         * Swap placeholders for subview elements, debounced
         */
        updatePlaceholders: function() {
            var $placeholders = $('body').find("[data-adapt-subview]");
            if (!$placeholders.length) return;
            $placeholders.each(function(index, placeholder) {
                var $placeholder = $(placeholder);
                var uid = parseInt($placeholder.attr("data-adapt-subview"));
                var invocation = this.findByUID(uid);
                if (!invocation || !invocation.hasInstance()) return;
                // Swap subview placeholder for subview element
                invocation.instance.replaceElement($placeholder);
            }.bind(this));
        },

        /**
         * Create an invocation item from the handlebars defined context
         * @param  {Object} context Handlebars context, containing and model id and subview class name
         * @return {Invocation}     Newly created or existing invocation
         */
        create: function(context) {
            var newInvocation = new Invocation(context);
            var existingInvocations = this.items.filter(function(entry) {
                if (!entry.isEqual(newInvocation)) return;
                return true;
            });
            if (!existingInvocations.length) {
                // If no existing and matching invocations are available, then
                // use the newly created invocation and create a subview instance
                this.items.push(newInvocation);
                this.updatePlaceholders();
                return newInvocation.createInstance();
            }
            if (existingInvocations.length > 1) {
                // If more than one invocation matched, then warn that there could
                // be rendering issues
                throw "SubViews: Overlapping views for name '"+newInvocation.name+"'";
            }
            // Reuse the single pre-existing invocation and its subview instance
            this.updatePlaceholders();
            return existingInvocations[0];
        },

        /**
         * Get an invocation from the current list based upon its unique id
         * @param  {Number} uid Placeholder defined invocation uid
         * @return {Invocation} Found invocation object
         */
        findByUID: function(uid) {
            return _.find(this.items, function(entry) {
                if (entry.uid !== uid) return;
                return entry;
            });
        },

        destroy: function() {
            // List length is liable to change during remove procedure
            // perform in reverse order.
            for (var i = this.items.length-1; i > -1; i--) {
                var invocation = this.items[i];
                invocation.destroy();
            }
            this.items.length = 0;
        },

        /**
         * When remove is called on subview, make sure to clear up invocation
         * @param  {SubView} instance
         */
        onRemoveSubView: function(instance) {
            for (var i = this.items.length-1; i > -1; i--) {
                var invocation = this.items[i];
                if (invocation.instance !== instance) continue;
                invocation.destroy();
                this.items.splice(i, 1);
            }
        }

    });

    var SubViews = Backbone.Controller.extend({

        Invocation: Invocation,
        Invocations: Invocations,
        SubView: SubView,

        classes: null,
        invocations: null,

        initialize: function() {
            this.classes = {};
            this.invocations = new Invocations();
        },

        /**
         * Register a named subview
         * @param  {String} name The name of your subview
         * @param  {Function} SubViewClass The subview class
         */
        register: function(name, SubViewClass) {
            this.classes[name] = SubViewClass;
        },

        /**
         * Return a subview class by name
         * @param  {String} name Name of the subview to return
         * @return {Function}
         */
        get: function(name) {
            return this.classes[name];
        }

    });

    return Adapt.subviews = new SubViews();

});
