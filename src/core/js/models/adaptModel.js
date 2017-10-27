define([
    'core/js/adapt',
    'core/js/logging'
], function (Adapt) {

    var AdaptModel = Backbone.Model.extend({

        defaults: {
            _canShowFeedback: true,
            _classes: "",
            _canReset: false,
            _isComplete: false,
            _isInteractionComplete: false,
            _requireCompletionOf: -1,
            _isEnabled: true,
            _isResetOnRevisit: false,
            _isAvailable: true,
            _isOptional: false,
            _isReady: false,
            _isVisible: true,
            _isLocked: false,
            _isHidden: false
        },

        trackable: [
            '_id',
            '_isComplete',
            '_isInteractionComplete'
        ],

        initialize: function () {
            // Wait until data is loaded before setting up model
            this.listenToOnce(Adapt, 'app:dataLoaded', this.setupModel);

        },

        setupModel: function() {
            if (this.get('_type') === 'page') {
                this._children = 'articles';
            }
            if (this._siblings === 'contentObjects' && this.get('_parentId') !== Adapt.course.get('_id')) {
                this._parent = 'contentObjects';
            }
            if (this._children) {
                //if parent is optional, apply to children
                if (this.get('_isOptional')) this.setOptional(true);

                this.setupChildListeners();
            }

            this.init();

            _.defer(_.bind(function() {
                if (this._children) {
                    this.checkCompletionStatus();

                    this.checkInteractionCompletionStatus();

                    this.checkLocking();
                }

                this.setupTrackables();

            }, this));

        },

        setupTrackables: function() {

            // Limit state trigger calls and make state change callbacks batched-asynchronous
            var originalTrackableStateFunction = this.triggerTrackableState;
            this.triggerTrackableState = _.compose(
                _.bind(function() {

                    // Flag that the function is awaiting trigger
                    this.triggerTrackableState.isQueued = true;

                }, this),
                _.debounce(_.bind(function() {
                    
                    // Trigger original function
                    originalTrackableStateFunction.apply(this);

                    // Unset waiting flag
                    this.triggerTrackableState.isQueued = false;

                }, this), 17)
            );

            // Listen to model changes, trigger trackable state change when appropriate
            this.listenTo(this, "change", function(model, value) {

                // Skip if trigger queued or adapt hasn't started yet
                if (this.triggerTrackableState.isQueued || !Adapt.attributes._isStarted) {
                    return;
                }

                // Check that property is trackable
                var trackablePropertyNames = _.result(this, 'trackable', []);
                var changedPropertyNames = _.keys(model.changed);
                var isTrackable = _.find(changedPropertyNames, function(item, index) {
                     return _.contains(trackablePropertyNames, item);
                }.bind(this));

                if (isTrackable) {
                    // Trigger trackable state change
                    this.triggerTrackableState();
                }

            });

        },

        setupChildListeners: function() {
            var children = this.getChildren();
            if (!children.length) {
                return;
            }

            this.listenTo(children, {
                "change:_isReady": this.checkReadyStatus,
                "change:_isComplete": this.onIsComplete,
                "change:_isInteractionComplete": this.checkInteractionCompletionStatus
            });
        },

        init: function() {},

        getTrackableState: function() {

            var trackable = this.resultExtend("trackable", []);
            var json = this.toJSON();

            var args = trackable;
            args.unshift(json);

            return _.pick.apply(_, args);

        },

        setTrackableState: function(state) {

            var trackable = this.resultExtend("trackable", []);

            var args = trackable;
            args.unshift(state);

            state = _.pick.apply(_, args);

            this.set(state);

            return this;

        },

        triggerTrackableState: function() {
            
            Adapt.trigger("state:change", this, this.getTrackableState());
            
        },

        reset: function(type, force) {
            if (!this.get("_canReset") && !force) return;

            type = type || true;

            switch (type) {
            case "hard": case true:
                this.set({
                    _isEnabled: true,
                    _isComplete: false,
                    _isInteractionComplete: false
                });
                break;
            case "soft":
                this.set({
                    _isEnabled: true,
                    _isInteractionComplete: false
                });
                break;
            }
        },

        checkReadyStatus: function () {
            // Filter children based upon whether they are available
            // Check if any return _isReady:false
            // If not - set this model to _isReady: true
            var children = this.getAvailableChildModels();
            if (_.find(children, function(child) { return child.get('_isReady') === false; })) {
                return;
            }

            this.set({_isReady: true});
        },

        setCompletionStatus: function() {
            if (this.get('_isVisible')) {
                this.set('_isComplete', true);
                this.set('_isInteractionComplete', true);
            }
        },

        checkCompletionStatus: function () {
            //defer to allow other change:_isComplete handlers to fire before cascading to parent
            Adapt.checkingCompletion();
            _.defer(_.bind(this.checkCompletionStatusFor, this, "_isComplete"));
        },

        checkInteractionCompletionStatus: function () {
            //defer to allow other change:_isInteractionComplete handlers to fire before cascading to parent
            Adapt.checkingCompletion();
            _.defer(_.bind(this.checkCompletionStatusFor, this, "_isInteractionComplete"));
        },

        /**
         * Function for checking whether the supplied completion attribute should be set to true or false. 
         * It iterates over our immediate children, checking the same completion attribute on any mandatory child
         * to see if enough/all of them them have been completed. If enough/all have, we set our attribute to true; 
         * if not, we set it to false.
         * @param {string} [completionAttribute] Either "_isComplete" or "_isInteractionComplete". Defaults to "_isComplete" if not supplied.
         */        
        checkCompletionStatusFor: function(completionAttribute) {
            if (!completionAttribute) completionAttribute = "_isComplete";

            var completed = false;
            var children = this.getAvailableChildModels();
            var requireCompletionOf = this.get("_requireCompletionOf");

            if (requireCompletionOf === -1) { // a value of -1 indicates that ALL mandatory children must be completed
                completed = (_.find(children, function(child) {
                    return !child.get(completionAttribute) && !child.get('_isOptional');
                }) === undefined);
            } else {
                completed = (_.filter(children, function(child) {
                    return child.get(completionAttribute) && !child.get('_isOptional');
                }).length >= requireCompletionOf);
            }

            this.set(completionAttribute, completed);

            Adapt.checkedCompletion();
        },

        findAncestor: function (ancestors) {

            var parent = this.getParent();

            if (this._parent === ancestors) {
                return parent;
            }

            var returnedAncestor = parent.getParent();

            if (parent._parent !== ancestors) {
                returnedAncestor = returnedAncestor.getParent();
            }

            // Returns a single model
            return returnedAncestor;

        },

        findDescendantModels: function(descendants) {
            var children = this.getChildren().models;

            // first check if descendant is child and return child
            if (this._children === descendants) {
                return children;
            }

            var allDescendants = [];
            var flattenedDescendants;
            var returnedDescendants;

            function searchChildren(models) {
                for (var i = 0, len = models.length; i < len; i++) {
                    var model = models[i];
                    allDescendants.push(model.getChildren().models);
                    flattenedDescendants = _.flatten(allDescendants);
                }

                returnedDescendants = flattenedDescendants;

                if (models.length === 0 || models[0]._children === descendants) {
                    return;
                } else {
                    allDescendants = [];
                    searchChildren(returnedDescendants);
                }
            }

            searchChildren(children);

            return returnedDescendants;
        },

        findDescendants: function (descendants) {
            Adapt.log.warn("DEPRECATED - Use findDescendantModels() as findDescendants() may be removed in the future");

            // first check if descendant is child and return child
            if (this._children === descendants) {
                return this.getChildren();
            }

            var allDescendants = [];
            var flattenedDescendants;
            var children = this.getChildren();
            var returnedDescendants;

            function searchChildren(children) {
                var models = children.models;
                for (var i = 0, len = models.length; i < len; i++) {
                    var model = models[i];
                    var childrensModels = model.getChildren().models;
                    allDescendants.push(childrensModels);
                    flattenedDescendants = _.flatten(allDescendants);
                }

                returnedDescendants = new Backbone.Collection(flattenedDescendants);

                if (children.models.length === 0 || children.models[0]._children === descendants) {
                    return;
                } else {
                    allDescendants = [];
                    searchChildren(returnedDescendants);
                }
            }

            searchChildren(children);

            // returns a collection of children
            return returnedDescendants;
        },

        getChildren: function () {
            if (this.get("_children")) return this.get("_children");

            var childrenCollection;

            if (!this._children) {
                childrenCollection = new Backbone.Collection();
            } else {
                var children = Adapt[this._children].where({_parentId: this.get("_id")});
                childrenCollection = new Backbone.Collection(children);
            }

            if (this.get('_type') == 'block' && childrenCollection.length == 2
                && childrenCollection.models[0].get('_layout') !== 'left' && this.get('_sortComponents') !== false) {
                // Components may have a 'left' or 'right' _layout,
                // so ensure they appear in the correct order
                // Re-order component models to correct it
                childrenCollection.comparator = '_layout';
                childrenCollection.sort();
            }

            this.set("_children", childrenCollection);

            // returns a collection of children
            return childrenCollection;
        },

        getAvailableChildModels: function() {
            return this.getChildren().where({
                _isAvailable: true
            });
        },

        getAvailableChildren: function() {
            Adapt.log.warn("DEPRECATED - Use getAvailableChildModels() as getAvailableChildren() may be removed in the future");

            return new Backbone.Collection(this.getChildren().where({
                _isAvailable: true
            }));
        },

        getParent: function () {
            if (this.get("_parent")) return this.get("_parent");
            if (this._parent === "course") {
                return Adapt.course;
            }
            var parent = Adapt.findById(this.get("_parentId"));
            this.set("_parent", parent);

            // returns a parent model
            return parent;
        },

        getAncestorModels: function(shouldIncludeChild) {
            var parents = [];
            var context = this;

            if (shouldIncludeChild) parents.push(context);

            while (context.has("_parentId")) {
                context = context.getParent();
                parents.push(context);
            }

            return parents.length ? parents : null;
        },

        getParents: function(shouldIncludeChild) {
            Adapt.log.warn("DEPRECATED - Use getAncestorModels() as getParents() may be removed in the future");

            var parents = [];
            var context = this;

            if (shouldIncludeChild) parents.push(context);

            while (context.has("_parentId")) {
                context = context.getParent();
                parents.push(context);
            }

            return parents.length ? new Backbone.Collection(parents) : null;
        },

        getSiblings: function (passSiblingsAndIncludeSelf) {
            var siblings;
            if (!passSiblingsAndIncludeSelf) {
                // returns a collection of siblings excluding self
                if (this._hasSiblingsAndSelf === false) {
                    return this.get("_siblings");
                }
                siblings = _.reject(Adapt[this._siblings].where({
                    _parentId: this.get("_parentId")
                }), _.bind(function (model) {
                    return model.get('_id') == this.get('_id');
                }, this));

                this._hasSiblingsAndSelf = false;

            } else {
                // returns a collection of siblings including self
                if (this._hasSiblingsAndSelf) {
                    return this.get("_siblings");
                }

                siblings = Adapt[this._siblings].where({
                    _parentId: this.get("_parentId")
                });
                this._hasSiblingsAndSelf = true;
            }

            var siblingsCollection = new Backbone.Collection(siblings);
            this.set("_siblings", siblingsCollection);
            return siblingsCollection;
        },

        setOnChildren: function (key, value, options) {

            var args = arguments;

            this.set.apply(this, args);

            if (!this._children) return;

            var children = this.getChildren();
            var models = children.models;
            for (var i = 0, len = models.length; i < len; i++) {
                var child = models[i];
                child.setOnChildren.apply(child, args);
            }

        },

        setOptional: function(value) {
            this.set({_isOptional: value});
        },

        checkLocking: function() {
            var lockType = this.get("_lockType");

            if (!lockType) return;

            switch (lockType) {
                case "sequential":
                    this.setSequentialLocking();
                    break;
                case "unlockFirst":
                    this.setUnlockFirstLocking();
                    break;
                case "lockLast":
                    this.setLockLastLocking();
                    break;
                case "custom":
                    this.setCustomLocking();
                    break;
                default:
                    console.warn("AdaptModel.checkLocking: unknown _lockType \"" +
                        lockType + "\" found on " + this.get("_id"));
            }
        },

        setSequentialLocking: function() {
            var children = this.getAvailableChildModels();

            for (var i = 1, j = children.length; i < j; i++) {
                children[i].set("_isLocked", !children[i - 1].get("_isComplete"));
            }
        },

        setUnlockFirstLocking: function() {
            var children = this.getAvailableChildModels();
            var isFirstChildComplete = children[0].get("_isComplete");

            for (var i = 1, j = children.length; i < j; i++) {
                children[i].set("_isLocked", !isFirstChildComplete);
            }
        },

        setLockLastLocking: function() {
            var children = this.getAvailableChildModels();
            var lastIndex = children.length - 1;

            for (var i = lastIndex - 1; i >= 0; i--) {
                if (!children[i].get("_isComplete")) {
                    return children[lastIndex].set("_isLocked", true);
                }
            }

            children[lastIndex].set("_isLocked", false);
        },

        setCustomLocking: function() {
            var children = this.getAvailableChildModels();

            for (var i = 0, j = children.length; i < j; i++) {
                var child = children[i];

                child.set("_isLocked", this.shouldLock(child));
            }
        },

        shouldLock: function(child) {
            var lockedBy = child.get("_lockedBy");

            if (!lockedBy) return false;

            for (var i = lockedBy.length - 1; i >= 0; i--) {
                var id = lockedBy[i];

                try {
                    var model = Adapt.findById(id);

                    if (!model.get("_isAvailable")) continue;
                    if (!model.get("_isComplete")) return true;
                }
                catch (e) {
                    console.warn("AdaptModel.shouldLock: unknown _lockedBy ID \"" + id +
                        "\" found on " + child.get("_id"));
                }
            }

            return false;
        },

        onIsComplete: function() {
            this.checkCompletionStatus();

            this.checkLocking();
        }

    });

    return AdaptModel;

});
