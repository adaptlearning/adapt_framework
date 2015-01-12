/*
 * Adapt
 * License - https://github.com/adaptlearning/adapt_framework/blob/master/LICENSE
 * Maintainers - Daryl Hedley <darylhedley@gmail.com>, Aniket Dharia
 */

define(function (require) {

    var Backbone = require('backbone');
    var Adapt = require('coreJS/adapt');

    var AdaptModel = Backbone.Model.extend({

        defaults: {
            _canShowFeedback: true,
            _isComplete: false,
            _isEnabled: true,
            _isEnabledOnRevisit: true,
            _isAvailable: true,
            _isOptional: false,
            _isTrackable: true,
            _isReady: false,
            _isVisible: true
        },

        lockedAttributes: {
            _canShowFeedback: {},
            _isEnabledOnRevisit: {},
            _isAvailable: {}, 
            _isOptional: {}, 
            _isTrackable: {}, 
            _isVisible: {}
        },

        initialize: function () {
            // Reset this.lockedAttributes on every model initialize
            this.lockedAttributes = {
                _isAvailable: {}, 
                _isOptional: {}, 
                _isTrackable: {}, 
                _isVisible: {}
            };
            // Wait until data is ready before setting up model
            Adapt.once('app:dataReady', this.setupModel, this);

        },

        setupModel: function() {
            if (this.get('_type') === 'page') {
                this._children = 'articles';
            }
            if (this._siblings === 'contentObjects' && this.get('_parentId') !== Adapt.course.get('_id')) {
                this._parent = 'contentObjects';
            }
            if (this._children) {
                Adapt[this._children].on({
                    "change:_isReady": this.checkReadyStatus,
                    "change:_isComplete": this.checkCompletionStatus
                }, this);
            }
            this.init();
        },

        init: function() {},

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
            if (availableChildren.findWhere({_isComplete: false})) return;
            this.set({_isComplete: true});
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

                children.each(function (model) {
                    var childrensModels = model.getChildren().models;
                    allDescendants.push(childrensModels);
                    flattenedDescendants = _.flatten(allDescendants);
                });

                returnedDescedants = new Backbone.Collection(flattenedDescendants);

                if (children.models[0]._children === descendants) {
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
            var children = Adapt[this._children].where({_parentId: this.get("_id")});
            var childrenCollection = new Backbone.Collection(children);
            this.set("_children", childrenCollection);

            // returns a collection of children
            return childrenCollection;
        },

        getParent: function () {
            if (this.get("_parent")) return this.get("_parent");
            if (this._parent === "course") {
                return Adapt.course;
            }
            var parent = Adapt[this._parent].where({_id: this.get("_parentId")});
            var parent = parent[0];
            this.set("_parent", parent);

            // returns a parent model
            return parent;
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

            this.getChildren().each(function (child) {
                child.setOnChildren.apply(child, args);
            })

        }

    });

    return AdaptModel;

});