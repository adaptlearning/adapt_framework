define([
    'core/js/models/adaptModel'
], function (AdaptModel) {

    var ComponentModel = AdaptModel.extend({
        _parent:'blocks',
        _siblings:'components',

        trackable: AdaptModel.resultExtend("trackable", [
            '_userAnswer'
        ])

    });

    return ComponentModel;

});
