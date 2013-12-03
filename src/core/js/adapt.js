/*
* Adapt
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Daryl Hedley, Fabien O'Carroll
*/

define(["underscore", "backbone"], function(_, Backbone){
    
    var Adapt = {};

    _.extend(Adapt, Backbone.Events);
    
    Adapt.initialize = _.once(function() {
        Adapt.trigger('adapt:initialize');
        Backbone.history.start();
    });
    
    Adapt.componentStore = {};
    
    Adapt.register = function(name, object) {
        
        if (Adapt.componentStore[name])
            throw Error('This component already exists in your project');
        object.prototype.constructor.template = name;
        Adapt.componentStore[name] = object;     
        
    }
    
    return Adapt;
    
});
