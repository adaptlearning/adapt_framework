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

    return Adapt;
    
});
