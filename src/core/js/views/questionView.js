/*
* QuestionView
* License - https://github.com/adaptlearning/adapt_framework/blob/master/LICENSE
* Maintainers - Daryl Hedley
*/

define(function(require) {

    var Handlebars = require('handlebars');
    var ComponentView = require('coreViews/componentView');
    var Adapt = require('coreJS/adapt');
    var ButtonsView = require('coreViews/buttonsView');

    var QuestionView = ComponentView.extend({
    
        className: function() {
            return "component "
            + "question-component " 
            + this.model.get('_component')
            + "-component " + this.model.get('_id') 
            + " " + this.model.get('_classes')
            + " " + this.setVisibility()
            + " component-" + this.model.get('_layout')
            + " nth-child-" + this.options.nthChild;
        },

        //////
        // Setup question types
        ////

        preRender: function() {
            // Setup listener for _isEnabled
            this.listenTo(this.model, 'change:_isEnabled', this.onEnabledChanged);
            // Checks to see if the question should be reset on revisit
            this.checkIfResetOnRevisit();
            // This method helps setup defualt settings on the model
            this.setupDefaultSettings();
            // Blank method for setting up questions before rendering
            this.setupQuestion();
            
        },

        // Used in the question view to disabled the question when _isEnabled has been set to false
        onEnabledChanged: function(model, changedAttribute) {

            // If isEnabled == false add disabled class
            // else remove disabled class
            if (!changedAttribute) {
                this.$('.component-widget').addClass('disabled');
                this.disableQuestion();
            } else {
                this.$('.component-widget').removeClass('disabled');
                this.enableQuestion();
            }

        },

        // Used by the question to disable the question during submit and complete stages
        disableQuestion: function() {},

        // Used by the question to enable the question during interactions
        enableQuestion: function() {},

        // Used to check if the question should reset on revisit
        checkIfResetOnRevisit: function() {

            var isResetOnRevisit = this.model.get('_isResetOnRevisit');

            // If reset is enabled set defaults
            // Call blank method for question to handle
            if (isResetOnRevisit) {
                var attempts = this.model.get('_attempts');
                this.model.set({
                    _isEnabled: true,
                    _attemptsLeft: attempts,
                    _isCorrect: false,
                    _isComplete: false,
                    _isSubmitted: false,
                    _buttonState: 'submit'
                });
                // Defer is added to allow the component to render
                _.defer(_.bind(function() {
                    this.resetQuestionOnRevisit();
                }, this));

            } else {

                // If complete - display users answer
                // or reset the question if not complete
                var isComplete = this.model.get('_isComplete');

                if (isComplete) {
                    this.model.set('_buttonState', 'hideCorrectAnswer');
                    // Defer is added to allow the component to render
                    _.defer(_.bind(function() {
                        this.onHideCorrectAnswerClicked(); 
                    }, this));
                    
                } else {
                    this.model.set('_buttonState', 'submit');
                    // Defer is added to allow the component to render
                    _.defer(_.bind(function() {
                        this.onResetClicked();
                    }, this));
                }

            }

        },

        // Used by the question to reset the question when revisiting the component
        resetQuestionOnRevisit: function() {},

        // Calls default methods to setup on questions
        setupDefaultSettings: function() {
            if(this.model.get("_canShowModelAnswer") === undefined) {
                this.model.set("_canShowModelAnswer", true);
            }

            this.setupButtonSettings();
            this.setupWeightSettings();
        },

        // Used to setup either global or local button text
        setupButtonSettings: function() {
               
            var compButtons =  this.model.get("_buttons");
            var globButtons = Adapt.course.get("_buttons");
            // check all the components buttons
            // if they are empty use the global default
            _.each(compButtons,function (value, key) {  
                if(!compButtons[key].buttonText) compButtons[key].buttonText = globButtons[key].buttonText
                if(!compButtons[key].ariaLabel) compButtons[key].ariaLabel = globButtons[key].ariaLabel
                
            },this);            
        },

        // Used to setup either global or local question weight/score
        setupWeightSettings: function() {
            // Checks if questionWeight exists and if not use global
            if (!this.model.has("_questionWeight")) {
                this.model.set("_questionWeight", Adapt.config.get("_questionWeight"));
            }

        },

        // Left blank for question setup - should be used instead of preRender
        setupQuestion: function() {},

        // Calls default methods to setup after the question is rendered
        postRender: function() {
            this.addButtonsView();
            this.onQuestionRendered();
        },

        // Used to setup buttonsView and sets up the internal events for the question
        addButtonsView: function() {
            this.buttonsView = new ButtonsView({model: this.model, el: this.$('.buttons')});
            this.listenTo(this.buttonsView, 'buttons:submit', this.onSubmitClicked);
            this.listenTo(this.buttonsView, 'buttons:reset', this.onResetClicked);
            this.listenTo(this.buttonsView, 'buttons:showCorrectAnswer', this.onShowCorrectAnswerClicked);
            this.listenTo(this.buttonsView, 'buttons:hideCorrectAnswer', this.onHideCorrectAnswerClicked);
            this.listenTo(this.buttonsView, 'buttons:showFeedback', this.showFeedback);
        },

        // Blank method used just like postRender is for presentational components
        onQuestionRendered: function() {},

        //////
        // Submit process
        ////

        // Triggered when the submit button is clicked
        onSubmitClicked: function() {

            // canSubmit is setup in questions and should return a boolean
            // If the question stops the user form submitting - show instruction error
            // and give a blank method, onCannotSubmit to the question
            if(!this.canSubmit()) {
                this.showInstructionError();
                this.onCannotSubmit();
                return;
            }

            // Used to update the amount of attempts the question has
            this.updateAttempts();
            
            // Used to set attributes on the model after being submitted
            // Also adds a class of submitted
            this.setQuestionAsSubmitted();
            
            // Used to remove instruction error that is set when
            // the user has interacted in the wrong way
            this.removeInstructionError();
            
            // Used to store the users answer for later
            // This is a blank method given to the question
            this.storeUserAnswer();

            // Used to set question as correct:true/false
            // Calls isCorrect which is blank for the question 
            // to fill out and return a boolean
            this.markQuestion();
            
            // Used by the question to set the score on the model
            this.setScore();
            
            // Used by the question to display markings on the component
            this.showMarking();
            
            // Used to check if the question is complete
            // Triggers setCompletionStatus and adds class to widget
            this.checkQuestionCompletion();
            
            // Used to update buttonsView based upon question state
            this.updateButtons();

            // Used to setup the feedback by checking against 
            // question isCorrect or isPartlyCorrect
            this.setupFeedback();

            // Used to trigger an event so plugins can display feedback
            this.showFeedback();

        },

        // Use to check if the user is allowed to submit the question
        // Maybe the user has to select an item?
        canSubmit: function() {},

        // Adds a validation error class when the canSubmit returns false
        showInstructionError: function() {
            this.$(".component-instruction-inner").addClass("validation-error");
        },

        // Blank method for question to fill out when the question cannot be submitted
        onCannotSubmit: function() {},

        // Used to update the amount of attempts the user has left
        updateAttempts: function() {
            if (!this.model.get('_attemptsLeft')) {
                this.model.set("_attemptsLeft", this.model.get('_attempts'));
            }
            this.model.set("_attemptsLeft", this.model.get('_attemptsLeft') - 1);
        },

        // Used to set _isEnabled and _isSubmitted on the model
        // Also adds a 'submitted' class to the widget
        setQuestionAsSubmitted: function() {
            this.model.set({
                _isEnabled: false,
                _isSubmitted: true
            });
            this.$(".component-widget").addClass("submitted");
        },

        // Removes validation error class when the user canSubmit
        removeInstructionError: function() {
            this.$(".component-instruction-inner").removeClass("validation-error");
        },

        // This is important for returning or showing the users answer
        // This should preserve the state of the users answers
        storeUserAnswer: function() {},

        // Sets _isCorrect:true/false based upon isCorrect method below
        markQuestion: function() {

            if (this.isCorrect()) {
                this.model.set('_isCorrect', true);
            } else {
                this.model.set('_isCorrect', false);
            }

        },

        // Should return a boolean based upon whether to question is correct or not
        isCorrect: function() {},

        // Used to set the score based upon the _questionWeight
        setScore: function() {},

        // This is important and should give the user feedback on how they answered the question
        // Normally done through ticks and crosses by adding classes
        showMarking: function() {},

        // Checks if the question should be set to complete
        // Calls setCompletionStatus and adds complete classes
        checkQuestionCompletion: function() {

            var isComplete = false;
            
            if (this.model.get('_isCorrect')) {
                isComplete = true;
            } else {
                if (this.model.get('_attemptsLeft') === 0) {
                    isComplete = true;
                }
            }

            if (isComplete) {
                this.setCompletionStatus();
                this.$('.component-widget').addClass('complete show-user-answer');
            }

        },

        // Updates buttons based upon question state by setting
        // _buttonState on the model which buttonsView listens to
        updateButtons: function() {

            var isComplete = this.model.get('_isComplete');
            var isCorrect = this.model.get('_isCorrect');
            var isEnabled = this.model.get('_isEnabled');
            var buttonState = this.model.get('_buttonState');

            if (isComplete) {
                if (isCorrect || !this.model.get('_canShowModelAnswer')) {
                    this.model.set('_buttonState', 'complete');
                } else {
                    if (buttonState === 'submit' || buttonState === 'hideCorrectAnswer'){
                        this.model.set('_buttonState', 'showCorrectAnswer');
                    } else {
                        this.model.set('_buttonState', 'hideCorrectAnswer');
                    }
                }
            } else {
                if (isEnabled) {
                    this.model.set('_buttonState', 'submit');
                } else {
                    this.model.set('_buttonState', 'reset');
                }
            }

        },

        // Used to setup the correct, incorrect and partly correct feedback
        setupFeedback: function() {

            if (this.model.get('_isCorrect')) {
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

            this.model.set({
                feedbackTitle: this.model.get('title'), 
                feedbackMessage: this.model.get("_feedback").correct
            });

        },

        setupPartlyCorrectFeedback: function() {

            if (this.model.get('_attemptsLeft') === 0 || !this.model.get('_feedback')._partlyCorrect.notFinal) {
                this.model.set({
                    feedbackTitle: this.model.get('title'),
                    feedbackMessage: this.model.get('_feedback')._partlyCorrect.final
                });
            } else {
                this.model.set({
                    feedbackTitle: this.model.get('title'),
                    feedbackMessage: this.model.get('_feedback')._partlyCorrect.notFinal
                });
            }

        },

        setupIncorrectFeedback: function() {

            if (this.model.get('_attemptsLeft') === 0 || !this.model.get('_feedback')._incorrect.notFinal) {
                this.model.set({
                    feedbackTitle: this.model.get('title'),
                    feedbackMessage: this.model.get('_feedback')._incorrect.final
                });
            } else {
                this.model.set({
                    feedbackTitle: this.model.get('title'),
                    feedbackMessage: this.model.get('_feedback')._incorrect.notFinal
                });
            }

        },
        
        // Used to show feedback based upon whether _canShowFeedback is true
        showFeedback: function() {
                
            if (this.model.get('_canShowFeedback')) {
                Adapt.trigger('questionView:showFeedback', this);
            } else {
                Adapt.trigger('questionView:disabledFeedback', this);
            }

        },

        onResetClicked: function() {
            this.setQuestionAsReset();
            this.updateButtons();
            this.resetUserAnswer();
            this.resetQuestion();
        },

        setQuestionAsReset: function() {
            this.model.set({
                _isEnabled: true,
                _isSubmitted: false
            });
            this.$(".component-widget").removeClass("submitted");
        },

        // Used by the question view to reset the stored user answer
        resetUserAnswer: function() {},

        // Used by the question view to reset the look and feel of the component.
        // This could also include resetting item data
        // This is triggered when the reset button is clicked so it shouldn't
        // be a full reset
        resetQuestion: function() {},

        onShowCorrectAnswerClicked: function() {
            this.setQuestionAsShowCorrect();
            this.updateButtons();
            this.showCorrectAnswer();
        },

        setQuestionAsShowCorrect: function() {
            this.$(".component-widget")
                .addClass("submitted show-correct-answer")
                .removeClass("show-user-answer");
        },

        // Used by the question to display the correct answer to the user
        showCorrectAnswer: function() {},

        onHideCorrectAnswerClicked: function() {
            this.setQuestionAsHideCorrect();
            this.updateButtons();
            this.hideCorrectAnswer();
        },

        setQuestionAsHideCorrect: function() {
            this.$(".component-widget")
                .addClass("submitted show-user-answer")
                .removeClass("show-correct-answer");
        },

        // Used by the question to display the users answer and
        // hide the correct answer
        // Should use the values stored in storeUserAnswer
        hideCorrectAnswer: function() {}
        
    }, {
        _isQuestionType: true
    });
    
    return QuestionView;

});