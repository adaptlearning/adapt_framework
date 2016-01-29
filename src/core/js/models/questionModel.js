define([
    'coreJS/adapt',
    'coreModels/componentModel'
], function(Adapt, ComponentModel) {

    var QuestionModel = ComponentModel.extend({

    	defaults: function() {
            return _.extend({
                '_isQuestionType': true
            }, ComponentModel.prototype.defaults);
        },

        reset: function(type, force) {
            if (!this.get("_canReset") && !force) return;

            type = type || true;

            AdaptModel.prototype.reset.call(this, type, force);

            var attempts = this.get('_attempts');
            this.set({
                _attemptsLeft: attempts,
                _isCorrect: undefined,
                _isSubmitted: false,
                _buttonState: 'submit'
            });
        }

    });

    return QuestionModel;

});
