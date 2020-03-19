/**
 * 2020-03-19 https://github.com/adaptlearning/adapt_framework/issues/2697
 * Added ES6-style constructor and static property inheritance rather than just 
 * copying the enumerable static properties each time.
 */
define('backbone.es6', [
  'underscore',
  'backbone',
  'backbone.controller'
], function(_, Backbone) {

  var classes = [ 
    Backbone.View, 
    Backbone.Model, 
    Backbone.Collection, 
    Backbone.Router, 
    Backbone.History, 
    Backbone.Controller 
  ];

  // Helper function to correctly set up the prototype chain for subclasses.
  // Similar to `goog.inherits`, but uses a hash of prototype properties and
  // class properties to be extended.
  var extend = function(protoProps, staticProps) {
    var parent = this;
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent constructor.
    if (protoProps && _.has(protoProps, 'constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ return parent.apply(this, arguments); };
    }

    // Create static property inheritance chain
    Object.setPrototypeOf(child, parent);

    // Add new static properties values to the constructor function, if supplied.
    _.extend(child, staticProps);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function and add the prototype properties.
    child.prototype = _.create(parent.prototype, protoProps);
    child.prototype.constructor = child;

    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.__super__ = parent.prototype;

    return child;
  };

  classes.forEach(function(Class) {
    Class.extend = extend;
  });

});
