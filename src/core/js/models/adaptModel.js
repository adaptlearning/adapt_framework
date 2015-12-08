define(function (require) {

    var Backbone = require('backbone');
    var Adapt = require('coreJS/adapt');

    var AdaptModel = Backbone.Model.extend({

        defaults: {
            _canShowFeedback: true,
            _canReset: false,
            _isComplete: false,
            _isInteractionComplete: false,
            _isEnabled: true,
            _isResetOnRevisit: false,
            _isAvailable: true,
            _isOptional: false,
            _isReady: false,
            _isVisible: true
        },

        initialize: function () {
            // Wait until data is loaded before setting up model
            Adapt.once('app:dataLoaded', this.setupModel, this);

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
                }
            }, this));
        },

        setupChildListeners: function() {

            if (!this.getChildren()) return;

            Adapt[this._children].on({
                "change:_isReady": this.checkReadyStatus,
                "change:_isComplete": this.checkCompletionStatus,
                "change:_isInteractionComplete": this.checkInteractionCompletionStatus
            }, this);

        },

        init: function() {},

        reset: function(type, force) {
            if (!this.get("_canReset") && !force) return;

            type = type || true;

            switch (type) {
            case "hard": case true:
                this.set({
                    _isEnabled: true,
                    _isComplete: false,
                    _isInteractionComplete: false,
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
            var availableChildren = new Backbone.Collection(this.getChildren().where({_isAvailable: true}));
            // Check if any return _isReady:false
            // If not - set this model to _isReady: true
            if (availableChildren.findWhere({_isReady: false})) return;
            this.set({_isReady: true});
        },

        checkCompletionStatus: function () {
            // Filter children based upon whether they are available
            var availableChildren = new Backbone.Collection(this.getChildren().where({_isAvailable: true}));
            // Check if any return _isComplete:false
            // If not - set this model to _isComplete: true
            if (availableChildren.findWhere({_isComplete: false, _isOptional: false})) {
                //cascade reset to menu
                this.set({_isComplete:false});
                return;
            }
            this.set({_isComplete: true});
        },

        checkInteractionCompletionStatus: function () {
            // Filter children based upon whether they are available
            var availableChildren = new Backbone.Collection(this.getChildren().where({_isAvailable: true}));
            // Check if any return _isInteractionComplete:false
            // If not - set this model to _isInteractionComplete: true
            if (availableChildren.findWhere({_isInteractionComplete: false, _isOptional: false})) {
                //cascade reset to menu
                this.set({_isInteractionComplete:false});
                return;
            }
            this.set({_isInteractionComplete: true});
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

        findDescendants: function (descendants) {

            // first check if descendant is child and return child
            if (this._children === descendants) {
                return this.getChildren();
            }

            var allDescendants = [];
            var flattenedDescendants;
            var children = this.getChildren();
            var returnedDescedants;

            function searchChildren(children) {
                var models = children.models;
                for (var i = 0, len = models.length; i < len; i++) {
                    var model = models[i];
                    var childrensModels = model.getChildren().models;
                    allDescendants.push(childrensModels);
                    flattenedDescendants = _.flatten(allDescendants);
                }

                returnedDescedants = new Backbone.Collection(flattenedDescendants);

                if (children.models.length === 0 || children.models[0]._children === descendants) {
                    return;
                } else {
                    allDescendants = [];
                    searchChildren(returnedDescedants);
                }
            }

            searchChildren(children);

            // returns a collection of children
            return returnedDescedants;
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
                && childrenCollection.models[0].get('_layout') !== 'left') {
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

        getParents: function(shouldIncludeChild) {
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
            if (this._children) this.setOnChildren('_isOptional', value);
        }


    });

    return AdaptModel;

});
