define([
    'core/js/adapt',
    'core/js/models/adaptModel'
], function (Adapt, AdaptModel) {

    var ComponentModel = AdaptModel.extend({
        _parent:'blocks',
        _siblings:'components',

        trackable: AdaptModel.resultExtend("trackable", [
            '_userAnswer'
        ])

    });

    return ComponentModel;

});
