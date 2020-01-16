// 2017-09-06 https://github.com/cgkineo/backbone.controller.results
/*
  These functions are useful to resolve instance properties which are an array or object
  or instance functions which return an array/object, to copy and extend the returned value.
*/
define('backbone.controller.results', [
    'underscore.results',
    'backbone.controller'
], function(_, Backbone) {

  var extend = [ Backbone.View, Backbone.Model, Backbone.Collection, Backbone.Controller ];

  function resultExtendClass() {

    var args = Array.prototype.slice.call(arguments, 0);
    args.unshift(this.prototype);

    return _.resultExtend.apply(this, args);

  };

  function resultExtendInstance() {

    var args = Array.prototype.slice.call(arguments, 0);
    args.unshift(this);

    return _.resultExtend.apply(this, args);

  };

  _.each(extend, function(item) {

    item.resultExtend = resultExtendClass;
    item.prototype.resultExtend = resultExtendInstance;

  });


});
