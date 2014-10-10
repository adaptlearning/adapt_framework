/*
* ButtonsView
* License - https://github.com/adaptlearning/adapt_framework/blob/master/LICENSE
* Maintainers - Daryl Hedley
*/

define(function() {

    var Adapt = require('coreJS/adapt');

    var ButtonsView = Backbone.View.extend({
        
        initialize: function() {
            this.listenTo(Adapt, 'remove', this.remove);
            this.listenTo(this.model, 'change:_buttonState', this.onButtonStateChanged);
            this.listenTo(this.model, 'change:feedbackMessage', this.onFeedbackMessageChanged);
            this.listenTo(this.model, 'change:_attemptsLeft', this.onAttemptsChanged);
            this.render();
        },

        events: {
            'click .buttons-action': 'onActionClicked',
            'click .buttons-feedback': 'onFeedbackClicked'
        },

        render: function() {
            var data = this.model.toJSON();
            var template = Handlebars.templates['buttons'];
            _.defer(_.bind(function() {
                this.postRender();
                Adapt.trigger('buttonsView:postRender', this);
            }, this));
            this.$el.html(template(data));
        },

        postRender: function() {
            this.updateAttemptsCount();
            this.onButtonStateChanged(null, this.model.get('_buttonState'));
            this.onFeedbackMessageChanged(null, this.model.get('feedbackMessage'));
        },

        onActionClicked: function() {
            var buttonState = this.model.get('_buttonState');
            this.trigger('buttons:' + buttonState);
        },

        onFeedbackClicked: function() {
            this.trigger('buttons:showFeedback');
        },

        onFeedbackMessageChanged: function(model, changedAttribute) {
            if (changedAttribute && this.model.get('_canShowFeedback')) {
                this.$('.buttons-feedback').attr('disabled', false);
            }
        },

        onButtonStateChanged: function(model, changedAttribute) {
            if (changedAttribute === 'correct') {
                this.$('.buttons-action').attr('disabled', true);
            } else {
                this.$('.buttons-action').html(this.model.get('_buttons')[changedAttribute]);
            }
            this.updateAttemptsCount();
        },

        updateAttemptsCount: function(model, changedAttribute) {
            var isComplete = this.model.get('_isComplete');
            var attemptsLeft = (this.model.get('_attemptsLeft')) ? this.model.get('_attemptsLeft') : this.model.get('_attempts')
            var isCorrect = this.model.get('_isCorrect');
            var shouldDisplayAttempts = this.model.get('_shouldDisplayAttempts');
            var attemptsString;                        
            if (!isComplete && attemptsLeft != 0) {
                attemptsString = attemptsLeft + " ";
                if (attemptsLeft > 1) {
                    attemptsString += this.model.get('_buttons').remainingAttemptsText;
                } else if (attemptsLeft === 1){
                    attemptsString += this.model.get('_buttons').remainingAttemptText;
                }

            } else {
                this.$('.buttons-display-inner').addClass('visibility-hidden');
                var $icon = this.$('.buttons-marking-icon').removeClass('display-none');
                if (isCorrect) {
                    $icon.addClass('icon-tick');
                } else {
                    $icon.addClass('icon-cross');
                }
            }

            if (shouldDisplayAttempts) {
                this.$('.buttons-display-inner').html(attemptsString);
            }
            
        }

    });

    return ButtonsView;

});