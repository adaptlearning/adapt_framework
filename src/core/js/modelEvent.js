define(function() {

  var ModelEvent = Backbone.Controller.extend({

    type: null,
    target: null,
    value: null,
    canBubble: true,
    deepPath: null,
    target: null,
    timeStamp: null,

    /**
     * @param {string} type Event name / type
     * @param {Backbone.Model} target Origin model
     * @param {*} [value] Any value that should be carried through on the event
     */
    initialize: function(type, target, value) {
      this.type = type;
      this.target = target;
      this.value = value;
      this.deepPath = [target];
    },

    stopPropagation: function() {
      this.canBubble = false;
    },

    addPath: function(target) {
      this.deepPath.unshift(target);
    }

  });

  return ModelEvent;

});
