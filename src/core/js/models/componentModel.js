define(function(require) {

    var Adapt = require('coreJS/adapt');
	var AdaptModel = require('coreModels/adaptModel');

    var ComponentModel = AdaptModel.extend({
    	init: function() {
    		// Setup _isQuestionType on question components
    		var componentType = this.get('_component');
            if (Adapt.componentStore[componentType]) {
        		if (Adapt.componentStore[componentType]._isQuestionType) {
        			this.set('_isQuestionType', true);
        		}
            }
    	},

        reset: function(type, force) {
            if (!this.get("_canReset") && !force) return;

            type = type || true;

            AdaptModel.prototype.reset.call(this, type, force);

            if (this.get("_isQuestionType")) {
                var attempts = this.get('_attempts');
                this.set({
                    _attemptsLeft: attempts,
                    _isCorrect: undefined,
                    _isSubmitted: false,
                    _buttonState: 'submit'
                });
            }
        },

        _parent:'blocks',
    	_siblings:'components'
    });

    return ComponentModel;

});
