define([
    'core/js/adapt',
    'core/js/models/componentModel',
    'core/js/enums/buttonStateEnum'
], function(Adapt, ComponentModel, BUTTON_STATE) {

    var QuestionModel = ComponentModel.extend({

        //////
        // Setup question types
        ////

        // Used to set model defaults
        defaults: function() {
            // Extend from the ComponentModel defaults
            return ComponentModel.resultExtend("defaults", {
                _isQuestionType: true,
                _shouldDisplayAttempts: false,
                _canShowModelAnswer: true,
                _canShowFeedback: true,
                _canShowMarking: true,
                _isSubmitted: false,
                _questionWeight: Adapt.config.get("_questionWeight"),
            });
        },

        // Extend from the ComponentModel trackable
        trackable: ComponentModel.resultExtend("trackable", [
            '_isSubmitted',
            '_score',
            '_isCorrect',
            '_attemptsLeft'
        ]),

        init: function() {
            this.setupDefaultSettings();
            this.listenToOnce(Adapt, "adapt:initialize", this.onAdaptInitialize);
        },

        // Calls default methods to setup on questions
        setupDefaultSettings: function() {
            // Not sure this is needed anymore, keeping to maintain API
            this.setupWeightSettings();
            this.setupButtonSettings();
        },

        // Used to setup either global or local button text
        setupButtonSettings: function() {
            var globalButtons = Adapt.course.get("_buttons");

            // Check if  '_buttons' attribute exists and if not use the globally defined buttons.
            if (!this.has("_buttons")) {
                this.set("_buttons", globalButtons);
            } else {
                // Check all the components buttons.
                // If they are empty use the global defaults.
                var componentButtons = this.get("_buttons");

                for (var key in componentButtons) {
                    if (typeof componentButtons[key] === 'object') {
                        // Button text.
                        if (!componentButtons[key].buttonText && globalButtons[key].buttonText) {
                            componentButtons[key].buttonText = globalButtons[key].buttonText;
                        }

                        // ARIA labels.
                        if (!componentButtons[key].ariaLabel && globalButtons[key].ariaLabel) {
                            componentButtons[key].ariaLabel = globalButtons[key].ariaLabel;
                        }
                    }

                    if (!componentButtons[key] && globalButtons[key]) {
                        componentButtons[key] = globalButtons[key];
                    }
                }
            }
        },

        // Used to setup either global or local question weight/score
        setupWeightSettings: function() {
            // Not needed as handled by model defaults, keeping to maintain API
        },

        //////
        // Selection restoration process
        ////


        // Used to add post-load changes to the model
        onAdaptInitialize: function() {
            this.restoreUserAnswers();
        },

        // Used to restore the user answers 
        restoreUserAnswers: function() {},

        
        //////
        // Submit process
        ////

        // Use to check if the user is allowed to submit the question
        // Maybe the user has to select an item?
        canSubmit: function() {},

        // Used to update the amount of attempts the user has left
        updateAttempts: function() {
            if (!this.get('_attemptsLeft')) {
                this.set("_attemptsLeft", this.get('_attempts'));
            }
            this.set("_attemptsLeft", this.get('_attemptsLeft') - 1);
        },

        // Used to set _isEnabled and _isSubmitted on the model
        setQuestionAsSubmitted: function() {
            this.set({
                _isEnabled: false,
                _isSubmitted: true
            });
        },

        // This is important for returning or showing the users answer
        // This should preserve the state of the users answers
        storeUserAnswer: function() {},

        // Sets _isCorrect:true/false based upon isCorrect method below
        markQuestion: function() {

            if (this.isCorrect()) {
                this.set('_isCorrect', true);
            } else {
                this.set('_isCorrect', false);
            }

        },

         // Should return a boolean based upon whether to question is correct or not
        isCorrect: function() {},

        // Used to set the score based upon the _questionWeight
        setScore: function() {},

        // Checks if the question should be set to complete
        // Calls setCompletionStatus and adds complete classes
        checkQuestionCompletion: function() {

            var isComplete = (this.get('_isCorrect') || this.get('_attemptsLeft') === 0);

            if (isComplete) {
                this.setCompletionStatus();
            }

            return isComplete;

        },

        // Updates buttons based upon question state by setting
        // _buttonState on the model which buttonsView listens to
        updateButtons: function() {

            var isInteractionComplete = this.get('_isInteractionComplete');
            var isCorrect = this.get('_isCorrect');
            var isEnabled = this.get('_isEnabled');
            var buttonState = this.get('_buttonState');
            var canShowModelAnswer = this.get('_canShowModelAnswer');

            if (isInteractionComplete) {

                if (isCorrect || !canShowModelAnswer) {
                    // Use correct instead of complete to signify button state
                    this.set('_buttonState', BUTTON_STATE.CORRECT);

                } else {

                    switch (buttonState) {
                        case BUTTON_STATE.SUBMIT:
                        case BUTTON_STATE.HIDE_CORRECT_ANSWER:
                            this.set('_buttonState', BUTTON_STATE.SHOW_CORRECT_ANSWER);
                            break;
                        default:
                            this.set('_buttonState', BUTTON_STATE.HIDE_CORRECT_ANSWER);
                    }

                }

            } else {

                if (isEnabled) {
                    this.set('_buttonState', BUTTON_STATE.SUBMIT);
                } else {
                    this.set('_buttonState', BUTTON_STATE.RESET);
                }
            }

        },

        // Used to setup the correct, incorrect and partly correct feedback
        setupFeedback: function() {

            if (this.get('_isCorrect')) {
                this.setupCorrectFeedback();
            } else if (this.isPartlyCorrect()) {
                this.setupPartlyCorrectFeedback();
            } else {
                this.setupIncorrectFeedback();
            }

        },

        // Used by the question to determine if the question is incorrect or partly correct
        // Should return a boolean
        isPartlyCorrect: function() {},

        setupCorrectFeedback: function() {

            this.set({
                feedbackTitle: this.get('title'),
                feedbackMessage: this.get("_feedback") ? this.get("_feedback").correct : ""
            });

        },

        setupPartlyCorrectFeedback: function() {

            if (this.get("_feedback") && this.get('_feedback')._partlyCorrect) {
                if (this.get('_attemptsLeft') === 0 || !this.get('_feedback')._partlyCorrect.notFinal) {
                    if (this.get('_feedback')._partlyCorrect.final) {
                        this.set({
                            feedbackTitle: this.get('title'),
                            feedbackMessage: this.get("_feedback") ? this.get('_feedback')._partlyCorrect.final : ""
                        });
                    } else {
                        this.setupIncorrectFeedback();
                    }
                } else {
                    this.set({
                        feedbackTitle: this.get('title'),
                        feedbackMessage: this.get("_feedback") ? this.get('_feedback')._partlyCorrect.notFinal : ""
                    });
                }
            } else {
                this.setupIncorrectFeedback();
            }

        },

        setupIncorrectFeedback: function() {

            if (this.get('_attemptsLeft') === 0 || this.get('_feedback') && !this.get('_feedback')._incorrect.notFinal) {
                this.set({
                    feedbackTitle: this.get('title'),
                    feedbackMessage: this.get("_feedback") ? this.get('_feedback')._incorrect.final : ""
                });
            } else {
                this.set({
                    feedbackTitle: this.get('title'),
                    feedbackMessage: this.get("_feedback") ? this.get('_feedback')._incorrect.notFinal : ""
                });
            }

        },

        // Reset the model to let the user have another go (not the same as attempts)
        reset: function(type, force) {
            if (!this.get("_canReset") && !force) return;

            type = type || true; //hard reset by default, can be "soft", "hard"/true

            ComponentModel.prototype.reset.call(this, type, force);

            var attempts = this.get('_attempts');
            this.set({
                _attemptsLeft: attempts,
                _isCorrect: undefined,
                _isSubmitted: false,
                _buttonState: BUTTON_STATE.SUBMIT
            });
        },

        // Reset question for subsequent attempts
        setQuestionAsReset: function() {
            this.set({
                _isEnabled: true,
                _isSubmitted: false
            });
        },

        // Used by the question view to reset the stored user answer
        resetUserAnswer: function() {},
        
        refresh: function() {
            this.trigger('question:refresh');
        },

        getButtonState: function() {
            if (this.get('_isCorrect')) {
                return BUTTON_STATE.CORRECT;
            }

            if (this.get('_attemptsLeft') === 0) {
                 return this.get('_canShowModelAnswer') ? BUTTON_STATE.SHOW_CORRECT_ANSWER : BUTTON_STATE.INCORRECT;
            }

            return this.get('_isSubmitted') ? BUTTON_STATE.RESET : BUTTON_STATE.SUBMIT;
        },

        // Returns an object specific to the question type, e.g. if the question
        // is a 'choice' this should contain an object with:
        // - correctResponsesPattern[]
        // - choices[]
        getInteractionObject: function() {
            return {};
        },

        // Returns a string detailing how the user answered the question.
        getResponse: function() {},

        // Returns a string describing the type of interaction: "choice" and "matching" supported (see scorm wrapper)
        getResponseType: function() {}

    });

    return QuestionModel;

});