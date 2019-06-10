define([
    'core/js/adapt',
    'core/js/enums/buttonStateEnum'
], function(Adapt, BUTTON_STATE) {

    //convert BUTTON_STATE to property name
    var textPropertyName = {
        "SUBMIT": "submit",
        "CORRECT": "correct",
        "INCORRECT": "incorrect",
        "SHOW_CORRECT_ANSWER": "showCorrectAnswer",
        "HIDE_CORRECT_ANSWER": "hideCorrectAnswer",
        "SHOW_FEEDBACK": "showFeedback",
        "RESET": "reset"
    };

    var ButtonsView = Backbone.View.extend({

        initialize: function(options) {
            this.parent = options.parent;

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
            this.refresh();
        },

        checkResetSubmittedState: function() {
            var isSubmitted = this.model.get('_isSubmitted');

            if (!isSubmitted) {

                var $icon = this.$('.buttons-marking-icon');
                $icon.removeClass('icon-cross');
                $icon.removeClass('icon-tick');
                $icon.addClass('display-none');
                this.$el.removeClass("submitted");
                this.model.set('feedbackMessage', undefined);
                Adapt.a11y.toggleAccessibleEnabled(this.$('.buttons-feedback'), false);

            } else {

                this.$el.addClass("submitted");

            }
        },

        onActionClicked: function() {
            var buttonState = this.model.get('_buttonState');
            this.trigger('buttons:stateUpdate', BUTTON_STATE(buttonState));
            this.checkResetSubmittedState();
        },

        onFeedbackClicked: function() {
            this.trigger('buttons:stateUpdate', BUTTON_STATE.SHOW_FEEDBACK);
        },

        onFeedbackMessageChanged: function(model, changedAttribute) {
            if (changedAttribute && this.model.get('_canShowFeedback')) {
                //enable feedback button
                Adapt.a11y.toggleAccessibleEnabled(this.$('.buttons-feedback'), true);
            } else {
                //disable feedback button
                Adapt.a11y.toggleAccessibleEnabled(this.$('.buttons-feedback'), false);
            }
        },

        onButtonStateChanged: function(model, changedAttribute) {

            this.updateAttemptsCount();

            // Use 'correct' instead of 'complete' to signify button state
            var $buttonsAction = this.$('.buttons-action');
            var buttonState = BUTTON_STATE(changedAttribute);
            if (changedAttribute === BUTTON_STATE.CORRECT || changedAttribute === BUTTON_STATE.INCORRECT) {
                // Both 'correct' and 'incorrect' states have no model answer, so disable the submit button

                Adapt.a11y.toggleAccessibleEnabled($buttonsAction, false);

            } else {

                var propertyName = textPropertyName[buttonState.asString];
                var ariaLabel = this.model.get('_buttons')["_" + propertyName].ariaLabel;
                var buttonText = this.model.get('_buttons')["_" + propertyName].buttonText;

                // Enable the button, make accessible and update aria labels and text

                Adapt.a11y.toggleAccessibleEnabled($buttonsAction, true);
                $buttonsAction.html(buttonText).attr('aria-label', ariaLabel);

                // Make model answer button inaccessible (but still enabled) for visual users due to
                // the inability to represent selected incorrect/correct answers to a screen reader, may need revisiting
                switch (changedAttribute) {
                    case BUTTON_STATE.SHOW_CORRECT_ANSWER:
                    case BUTTON_STATE.HIDE_CORRECT_ANSWER:

                        Adapt.a11y.toggleAccessible($buttonsAction, false);

                }

            }
        },

        checkFeedbackState: function(){
            var canShowFeedback = this.model.get('_canShowFeedback');

            this.$('.buttons-action').toggleClass('buttons-action-fullwidth buttons-action-enlarge', !canShowFeedback);
            this.$('.buttons-feedback').toggleClass('no-feedback', !canShowFeedback);
            this.$('.buttons-marking-icon').toggleClass('no-feedback', !canShowFeedback);
        },

        updateAttemptsCount: function(model, changedAttribute) {
            var isInteractionComplete = this.model.get('_isInteractionComplete');
            var attemptsLeft = (this.model.get('_attemptsLeft')) ? this.model.get('_attemptsLeft') : this.model.get('_attempts');
            var isCorrect = this.model.get('_isCorrect');
            var shouldDisplayAttempts = this.model.get('_shouldDisplayAttempts');
            var attemptsString;

            this.checkResetSubmittedState();

            if (!isInteractionComplete && attemptsLeft != 0) {
                attemptsString = attemptsLeft + " ";
                if (attemptsLeft > 1) {
                    attemptsString += this.model.get('_buttons').remainingAttemptsText;
                } else if (attemptsLeft === 1){
                    attemptsString += this.model.get('_buttons').remainingAttemptText;
                }

            } else {
                this.$('.buttons-display-inner').addClass('visibility-hidden');
                this.showMarking();
            }

            if (shouldDisplayAttempts) {
                this.$('.buttons-display-inner').html(attemptsString);
            }

        },

        showMarking: function() {
            if (!this.model.get('_canShowMarking')) return;

            var isCorrect = this.model.get('_isCorrect');
            var ariaLabels = Adapt.course.get('_globals')._accessibility._ariaLabels;

            this.$('.buttons-marking-icon')
                .removeClass('display-none')
                .addClass(isCorrect ? 'icon-tick' : 'icon-cross')
                .attr('aria-label', isCorrect ? ariaLabels.answeredCorrectly : ariaLabels.answeredIncorrectly);
        },

        refresh: function() {
            this.updateAttemptsCount();
            this.checkResetSubmittedState();
            this.checkFeedbackState();
            this.onButtonStateChanged(null, this.model.get('_buttonState'));
            this.onFeedbackMessageChanged(null, this.model.get('feedbackMessage'));
        }

    });

    return ButtonsView;

});
