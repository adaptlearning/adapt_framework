/*
 * Adapt
 * License - https://github.com/adaptlearning/adapt_framework/blob/master/LICENSE
 * Maintainers - Daryl Hedley <darylhedley@gmail.com>, Aniket Dharia
 */

define(function (require) {

    var Backbone = require('backbone');
    var Adapt = require('coreJS/adapt');

    Backbone.Model = Backbone.Model.extend({

        initialize: function() {
            // Reset this.lockedAttributes on every model initialize
            this.lockedAttributes = {
                _isAvailable: {}, 
                _isOptional: {}, 
                _isTrackable: {}, 
                _isVisible: {}
            };
            this.init();
        },

        lockedAttributes: {
            _isAvailable: {}, 
            _isOptional: {}, 
            _isTrackable: {}, 
            _isVisible: {}
        },

        init: function() {

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
            // If reset is passed as an option forget validating
            // This is to overcome the initial load of models and collections
            if (options.reset) {
                return true;
            }

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

});