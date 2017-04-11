define([
    'core/js/adapt',
    'core/js/models/adaptModel'
], function (Adapt, AdaptModel) {

    var ComponentModel = AdaptModel.extend({
        _parent:'blocks',
        _siblings:'components',

        trackableProperties: [
            "_isComplete",
            "_isInteractionComplete",
            "_userAnswer"
        ],

        getState: function() {

            var trackable = this.resultCopy("trackableProperties", []);
            var json = this.toJSON();

            var args = trackable;
            args.unshift(json);

            return _.pick.apply(_, args);

        },

        setState: function(state) {

            var trackable = this.resultCopy("trackableProperties", []);

            var args = trackable;
            args.unshift(state);

            state = _.pick.apply(_, args);

            this.set(state);

            return this;

        },

        triggerState: function() {
            Adapt.trigger("state:change", this.getState());
        }

    });

    return ComponentModel;

});
