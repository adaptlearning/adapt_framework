/*
* Adapt
* License - https://github.com/adaptlearning/adapt_framework/blob/master/LICENSE
* Maintainers - Daryl Hedley, Fabien O'Carroll
*/

define(function(require){

    var _ = require('underscore');
    var Backbone = require('backbone');
    var Helpers = require('coreHelpers');
    
    var Adapt = {};

    _.extend(Adapt, Backbone.Events);
    
    Adapt.initialize = _.once(function() {
        Backbone.history.start();
        Adapt.trigger('adapt:initialize');
    });
    
    Adapt.componentStore = {};
    
    Adapt.register = function(name, object) {
        
        if (Adapt.componentStore[name])
            throw Error('This component already exists in your project');
        object.template = name;
        Adapt.componentStore[name] = object;
        
    }
    
    return Adapt;
    
});
