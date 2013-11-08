/*
* Adapt
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Daryl Hedley, Fabien O'Carroll
*/

define(["underscore", "backbone"], function(_, Backbone){
    
    var Adapt = {};

    _.extend(Adapt, Backbone.Events);
    
    Adapt.initialize = _.once(function() {
        console.log('Adapt running');
        Adapt.trigger('adapt:initialize');
        console.log(Adapt);
        Backbone.history.start();
    });
    
    Adapt.componentStore = {};

    return Adapt;
    
});
