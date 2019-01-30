define(function() {

    var ModelEvent = Backbone.Controller.extend({

        type: null,
        target: null,
        value: null,
        bubbles: true,
        deepPath: null,
        target: null,
        timeStamp: null,

        initialize: function(type, target, value) {
            this.type = type;
            this.target = target;
            this.value = value;
            this.deepPath = [target];
        },

        stopPropagation: function() {
            this.bubbles = false;
        },

        addPath: function(target) {
            this.deepPath.unshift(target);
        }

    });

    return ModelEvent;

});
