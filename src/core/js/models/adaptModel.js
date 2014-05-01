/*
 * Adapt
 * License - https://github.com/adaptlearning/adapt_framework/blob/master/LICENSE
 * Maintainers - Daryl Hedley, Aniket Dharia
 */

define(function (require) {

    var Backbone = require('backbone');
    var Adapt = require('coreJS/adapt');

    var AdaptModel = Backbone.Model.extend({

        initialize: function() {
            // Reset this.lockedAttributes on every model initialize
            this.lockedAttributes = {
                _isAvailable: {}, 
                _isOptional: {}, 
                _isTrackable: {}, 
                _isVisible: {}
            };
            this._canValidateLockedAttributes = false;
            this.listenTo(Adapt, 'app:dataReady', function () {
                this._canValidateLockedAttributes = true;
            }, this);
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

        defaults: {
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
            _isAvailable: {},
            _isOptional: {},
            _isTrackable: {},
            _isVisible: {}
        },

        init: function () {
        },

        checkReadyStatus: function () {
            if (this.getChildren().findWhere({_isReady: false})) return;
            this.set({_isReady: true});
        },

        checkCompletionStatus: function () {
            if (this.getChildren().findWhere({_isComplete: false})) return;
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

        },

        validate: function (attrs, options) {
            // This is returned and is set on model
            var returnObject = {};
            // Object containing any locked attributes trying to be set on the model
            var lockedAttributes = {};
            var pluginName = options.pluginName;

            // Go through each attribute being set and check if it's in the list of lockedAttributes
            // Add it to the lockedAttributes object
            _.each(attrs, function(value, key) {
                var hasLockedAttribute = _.has(this.lockedAttributes, key);

                if (hasLockedAttribute) {
                    lockedAttributes[key] = value
                }

            }, this);

            // Check if there are locked attributes
            if (!_.isEmpty(lockedAttributes)) {
                // Check if options has a plugin name
                if (!pluginName) {
                    var validateError = 'When setting a locked attribute on the model please specify a pluginName in the options object';
                    var lockedAttributesKeys = _.keys(lockedAttributes);
                    // Leave this console in - is used for debugging
                    console.log(validateError, lockedAttributesKeys);
                    this.validatedAttributes = _.omit(attrs, lockedAttributesKeys);
                    return validateError;
                }

                // Go through each lockedAttributes and set on this.lockedAttributes
                _.each(lockedAttributes, function (value, key) {
                    this.lockedAttributes[key][pluginName] = value;
                    var trueAttributes = _.filter(this.lockedAttributes[key], function (value, key) {
                        // Return all attributes that have true values
                        return value === true;
                    });

                    // Check if attribute should be set to true
                    if (_.size(this.lockedAttributes[key]) === trueAttributes.length) {
                        lockedAttributes[key] = true;
                        // Check if attribute should be set to false
                    } else if (trueAttributes.length === 0) {
                        lockedAttributes[key] = false;
                        // Check if attribute should not be set
                    } else {
                        lockedAttributes[key] = this.get(key);
                    }
                }, this);

                //return
                var returnAttributes = _.extend(attrs, lockedAttributes);
                this.validatedAttributes = returnAttributes;
                //return;
            } else {
                this.validatedAttributes = attrs;
                //return;
            }

        },

        isValid: function () {
            return console.log('Sorry, This is not supported in Adapt');
        },

        _validate: function (attrs, options) {
            // Run validation.
            if (!this._canValidateLockedAttributes) {
                return true;
            }

            //var validateMessage = this.validate(attrs, options);

            // Check if there's a validateError
            var error = this.validationError = this.validate(attrs, options) || null;
            if (!error) return true;
            this.trigger('invalid', this, error, _.extend(options, {validationError: error}));
            return false;
        },

        set: function (key, val, options) {
            var attr, attrs, unset, changes, silent, changing, prev, current;
            if (key == null) return this;

            // Handle both `"key", value` and `{key: value}` -style arguments.
            if (typeof key === 'object') {
                attrs = key;
                options = val;
            } else {
                (attrs = {})[key] = val;
            }

            options || (options = {});

            // Run validation.
            this._validate(attrs, options);

            // If validatedAttributes exist use these instead of the attributes passed in
            if (this.validatedAttributes != null) {
                attrs = this.validatedAttributes;
            }

            // Extract attributes and options.
            unset = options.unset;
            silent = options.silent;
            changes = [];
            changing = this._changing;
            this._changing = true;

            if (!changing) {
                this._previousAttributes = _.clone(this.attributes);
                this.changed = {};
            }
            current = this.attributes, prev = this._previousAttributes;

            // Check for changes of `id`.
            if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

            // For each `set` attribute, update or delete the current value.
            for (attr in attrs) {
                val = attrs[attr];
                if (!_.isEqual(current[attr], val)) changes.push(attr);
                if (!_.isEqual(prev[attr], val)) {
                    this.changed[attr] = val;
                } else {
                    delete this.changed[attr];
                }
                unset ? delete current[attr] : current[attr] = val;
            }

            // Trigger all relevant attribute changes.
            if (!silent) {
                if (changes.length) this._pending = true;
                for (var i = 0, l = changes.length; i < l; i++) {
                    this.trigger('change:' + changes[i], this, current[changes[i]], options);
                }
            }
            // Clear validatedAttributes cache
            this.validatedAttributes = null;
            // You might be wondering why there's a `while` loop here. Changes can
            // be recursively nested within `"change"` events.
            if (changing) return this;
            if (!silent) {
                while (this._pending) {
                    this._pending = false;
                    this.trigger('change', this, options);
                }
            }
            this._pending = false;
            this._changing = false;
            
            return this;
        }

    });

    return AdaptModel;

});