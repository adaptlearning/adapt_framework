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
                this.$('.buttons-feedback').a11y_cntrl_enabled(false);

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
                this.$('.buttons-feedback').a11y_cntrl_enabled(true);
            } else {
                //disable feedback button
                this.$('.buttons-feedback').a11y_cntrl_enabled(false);
            }
        },

        onButtonStateChanged: function(model, changedAttribute) {
            // Use 'correct' instead of 'complete' to signify button state
            var buttonState = BUTTON_STATE(changedAttribute);
            if (changedAttribute === BUTTON_STATE.CORRECT || changedAttribute === BUTTON_STATE.INCORRECT) {
                // Both 'correct' and 'incorrect' states have no model answer, so disable the submit button
                this.$('.buttons-action').a11y_cntrl_enabled(false);

                if (!this.model.get("_canShowFeedback")) {
                    if (!this.$el.is(".no-state")) {
                        //if no feedback, complete correct and has state, force focus to component state
                        _.defer(_.bind(function() {
                            $("." + this.model.get("_id") + " .accessibility-state [tabindex]").focusNoScroll();
                        }, this));
                    }
                }
              
            } 

            this.updateAttemptsCount();
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
                this.$('.buttons-display-inner').a11y_text(attemptsString);
            }

        },

        showMarking: function() {
            if (!this.model.get('_canShowMarking')) return;

            this.$('.buttons-marking-icon')
                .removeClass('display-none')
                .addClass(this.model.get('_isCorrect') ? 'icon-tick' : 'icon-cross');
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