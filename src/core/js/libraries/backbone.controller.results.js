// 2017-04-11 https://github.com/cgkineo/underscore.results
/*
    These function are useful inside as methods to grab instance or class properties listed either as
    an array/object or a function which returns an array/object, to create a copy of the
    returned value or to extend a copy of the returned value.
*/
define('backbone.results', [
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

    function resultCopyClass() {

        var args = Array.prototype.slice.call(arguments, 0);
        args.unshift(this.prototype);

        return _.resultCopy.apply(_, args);

    }

    function resultCopyInstance() {

        var args = Array.prototype.slice.call(arguments, 0);
        args.unshift(this);

        return _.resultCopy.apply(_, args);

    }
    
    _.each(extend, function(item) {

        item.resultExtend = resultExtendClass;
        item.prototype.resultExtend = resultExtendInstance;

        item.resultCopy = resultCopyClass;
        item.prototype.resultCopy = resultCopyInstance;

    });


});