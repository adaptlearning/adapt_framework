define([
    'core/js/models/adaptModel'
], function (AdaptModel) {

    var ComponentModel = AdaptModel.extend({
        _parent:'blocks',
        _siblings:'components',

        defaults: AdaptModel.resultExtend('defaults', {
            _isA11yComponentDescriptionEnabled: true
        }),

        trackable: AdaptModel.resultExtend("trackable", [
            '_userAnswer'
        ])

    });

    return ComponentModel;

});
