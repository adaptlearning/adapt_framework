/*
* Adapt
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Author - Fabien O'Carroll
* Maintainers - Fabien O'Carroll
*/

define(["underscore", "backbone"], function(_, Backbone){
    
    var Adapt = {};

    _.extend(Adapt, Backbone.Events);
    
    Adapt.initialize = _.once(function() {
        console.log('Adapt running');
        Adapt.trigger('adapt:initialize');
    });

    return Adapt;
    
});
