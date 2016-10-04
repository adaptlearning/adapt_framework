define([
    'coreJS/adapt',
    'coreModels/componentModel'
], function(Adapt, ComponentModel) {

    var QuestionModel = ComponentModel.extend({

        //////
        // Setup question types
        ////

        // Used to set model defaults
        defaults: function() {
            // Extend from the ComponentModel defaults
            return _.extend({
                '_isQuestionType': true,
                '_shouldDisplayAttempts': false,
                '_canShowModelAnswer': true,
                '_canShowFeedback': true,
                '_canShowMarking': true,
                '_questionWeight': Adapt.config.get("_questionWeight"),
            }, ComponentModel.prototype.defaults);
        },

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

            // Checks if local _buttons exists and if not use global
            if (!this.has("_buttons")) {
                this.set("_buttons", globalButtons);
            } else {
                // check all the components buttons
                // if they are empty use the global default
                var componentButtons = this.get("_buttons");

                if (typeof componentButtons.submit == 'undefined') {
                    for (var key in componentButtons) {
                        if (typeof componentButtons[key] == 'object') {
                          // ARIA labels
                          if (!componentButtons[key].buttonText && globalButtons[key].buttonText) {
                            componentButtons[key].buttonText = globalButtons[key].buttonText;
                          }

                          if (!componentButtons[key].ariaLabel && globalButtons[key].ariaLabel) {
                            componentButtons[key].ariaLabel = globalButtons[key].ariaLabel;
                          }
                        }

                        if (!componentButtons[key] && globalButtons[key]) {
                            componentButtons[key] = globalButtons[key];
                        }
                    }
                } else {
                    // Backwards compatibility with v1.x
                    var buttons = [];

                    for (var key in componentButtons) {
                        var index = '_' + key;

                        if (!componentButtons[key]) {
                            buttons[index] = globalButtons[index];
                        } else {
                            buttons[index] = {
                                buttonText: componentButtons[key],
                                ariaLabel: componentButtons[key]
                            };
                        }
                    }

                    // HACK - Append other missing values
                    buttons['_showFeedback'] = {
                        buttonText: 'Show feedback',
                        ariaLabel: 'Show feedback'
                    };

                    this.set('_buttons', buttons);
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
                    this.set('_buttonState', 'correct');

                } else {

                    switch (buttonState) {
                      case "submit":
                      case "hideCorrectAnswer":
                          this.set('_buttonState', 'showCorrectAnswer');
                          break;
                      default:
                          this.set('_buttonState', 'hideCorrectAnswer');
                    }

                }

            } else {

                if (isEnabled) {
                    this.set('_buttonState', 'submit');
                } else {
                    this.set('_buttonState', 'reset');
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
                _buttonState: 'submit'
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
        resetUserAnswer: function() {}


    });

    return QuestionModel;

});
