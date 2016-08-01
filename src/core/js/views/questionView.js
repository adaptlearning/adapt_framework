define([
    'coreJS/adapt',
    'coreViews/componentView',
    'coreViews/buttonsView',
    'coreModels/questionModel'
], function(Adapt, ComponentView, ButtonsView, QuestionModel) {

    var useQuestionModelOnly = false;

    var QuestionView = ComponentView.extend({

        className: function() {
            return "component "
            + "question-component "
            + this.model.get('_component')
            + "-component " + this.model.get('_id')
            + " " + this.model.get('_classes')
            + " " + this.setVisibility()
            + " component-" + this.model.get('_layout')
            + " nth-child-" + this.model.get("_nthChild");
        },

        //////
        // Setup question types
        ////

        preRender: function() {
            // Setup listener for _isEnabled
            this.listenTo(this.model, 'change:_isEnabled', this.onEnabledChanged);
            // Checks to see if the question should be reset on revisit
            this.checkIfResetOnRevisit();
            // This method helps setup default settings on the model
            this._runModelCompatibleFunction("setupDefaultSettings");
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

                this.model.reset(isResetOnRevisit, true);

                 // Defer is added to allow the component to render
                _.defer(_.bind(function() {
                   this.resetQuestionOnRevisit(isResetOnRevisit);
                }, this));

            } else {

                // If complete - display users answer
                // or reset the question if not complete
                var isInteractionComplete = this.model.get('_isInteractionComplete');

                if (isInteractionComplete) {
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
        resetQuestionOnRevisit: function(type) {},

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
            var canSubmit = this._runModelCompatibleFunction("canSubmit");

            if(!canSubmit) {
                this.showInstructionError();
                this.onCannotSubmit();
                return;
            }

            // Used to update the amount of attempts the question has
            this._runModelCompatibleFunction("updateAttempts");

            // Used to set attributes on the model after being submitted
            // Also adds a class of submitted
            this._runModelCompatibleFunction("setQuestionAsSubmitted");

            // Used to remove instruction error that is set when
            // the user has interacted in the wrong way
            this.removeInstructionError();

            // Used to store the users answer for later
            // This is a blank method given to the question
            this._runModelCompatibleFunction("storeUserAnswer");

            // Used to set question as correct:true/false
            // Calls isCorrect which is blank for the question
            // to fill out and return a boolean
            this._runModelCompatibleFunction("markQuestion", "isCorrect");

            // Used by the question to set the score on the model
            this._runModelCompatibleFunction("setScore");

            // Used by the question to display markings on the component
            this.showMarking();

            // Used to check if the question is complete
            // Triggers setCompletionStatus and adds class to widget
            this._runModelCompatibleFunction("checkQuestionCompletion");

            this.recordInteraction();

            // Used to setup the feedback by checking against
            // question isCorrect or isPartlyCorrect
            this._runModelCompatibleFunction("setupFeedback");

            // Used to update buttonsView based upon question state
            // Update buttons happens before showFeedback to preserve tabindexes and after setupFeedback to allow buttons to use feedback attribute
            this._runModelCompatibleFunction("updateButtons");

            // Used to trigger an event so plugins can display feedback
            this.showFeedback();
            
            this.onSubmitted();
        },

        // Adds a validation error class when the canSubmit returns false
        showInstructionError: function() {
            this.$(".component-instruction-inner").addClass("validation-error");
            this.$el.a11y_focus();
        },

        // Blank method for question to fill out when the question cannot be submitted
        onCannotSubmit: function() {},

        // Blank method for question to fill out when the question was successfully submitted
        onSubmitted: function() {},

        // Used to set _isEnabled and _isSubmitted on the model
        // Also adds a 'submitted' class to the widget
        setQuestionAsSubmitted: function() {
            this.model.setQuestionAsSubmitted();
            this.$(".component-widget").addClass("submitted");
        },

        // Removes validation error class when the user canSubmit
        removeInstructionError: function() {
            this.$(".component-instruction-inner").removeClass("validation-error");
        },

        // This is important and should give the user feedback on how they answered the question
        // Normally done through ticks and crosses by adding classes
        showMarking: function() {},

        // Checks if the question should be set to complete
        // Calls setCompletionStatus and adds complete classes
        checkQuestionCompletion: function() {

            var isComplete = this.model.checkQuestionCompletion();

            if (isComplete) {
                this.$('.component-widget').addClass('complete show-user-answer');
            }

        },

        recordInteraction:function() {
            if (this.model.get('_recordInteraction') === true || !this.model.has('_recordInteraction')) {
                Adapt.trigger('questionView:recordInteraction', this);
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
            
            this._runModelCompatibleFunction("updateButtons");

            this._runModelCompatibleFunction("resetUserAnswer");

            this.resetQuestion();
            if (this.model.get("_isReady")) {
                //if the model is already rendered, focus on the first tabbable element
                //onResetClicked is called as part of the checkIfResetOnRevisit function and as a button click
                _.defer(_.bind(function(){
                    this.$el.a11y_focus();
                }, this));
            }
        },

        setQuestionAsReset: function() {
            this.model.setQuestionAsReset();
            this.$(".component-widget").removeClass("submitted");
            
            // Attempt to get the current page location
            var currentModel = Adapt.findById(Adapt.location._currentId);
            if (currentModel && currentModel.get("_isReady")) {
                //if the page is ready, focus on the first tabbable item
                //otherwise will try to set focus as page loads and components are rendered
                this.$el.a11y_focus();
            }
        },

        // Used by the question view to reset the look and feel of the component.
        // This could also include resetting item data
        // This is triggered when the reset button is clicked so it shouldn't
        // be a full reset
        resetQuestion: function() {},

        onShowCorrectAnswerClicked: function() {
            this.setQuestionAsShowCorrect();

            this._runModelCompatibleFunction("updateButtons");

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

            this._runModelCompatibleFunction("updateButtons");

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
        hideCorrectAnswer: function() {},

        // Time elapsed between the time the interaction was made available to the learner for response and the time of the first response
        getLatency:function() {
            return null;
        },

        // a string detailing how the user answered the question
        getResponse:function() {},

        // a string describing the type of interaction: "choice" and "matching" supported (see scorm wrapper)
        getResponseType:function() {},

        // This function is overridden if useQuestionModeOnly: false. see below.
        _runModelCompatibleFunction: function(name, lookForViewOnlyFunction) {
            return this.model[name](); //questionModel Only
        }

    }, {
        _isQuestionType: true
    });


    //allows us to turn on and off the questionView style and use the separated questionModel+questionView style only
    if (useQuestionModelOnly) return QuestionView;

    /*BACKWARDS COMPATIBILITY SECTION
    * This section below is only for compatibility between the separated questionView+questionModel and the old questionView
    * Remove this section in when all components use questionModel and there is no need to have model behaviour in the questionView
    */

    var viewOnlyCompatibleQuestionView = {

        /* All of these functions have been moved to the questionModel.js file. 
         * On the rare occasion that they have not been overridden by the component and 
                that they call the view only questionView version, 
                these functions are included as redirects to the new Question Model.
                It is very unlikely that these are needed but they are included to ensure compatibility.
         * If you need to override these in your component you should now make and register a component model.
         * Please remove them from your question component's view.
        */

            // Calls default methods to setup on questions
            setupDefaultSettings: function() {
                return this.model.setupDefaultSettings();
            },

            // Used to setup either global or local button text
            setupButtonSettings: function() {
                return this.model.setupButtonSettings();
            },

            // Used to setup either global or local question weight/score
            setupWeightSettings: function() {
                return this.model.setupWeightSettings();
            },

            // Use to check if the user is allowed to submit the question
            // Maybe the user has to select an item?
            canSubmit: function() {
                return this.model.canSubmit();
            },

            // Used to update the amount of attempts the user has left
            updateAttempts: function() {
                return this.model.updateAttempts();
            },

            // This is important for returning or showing the users answer
            // This should preserve the state of the users answers
            storeUserAnswer: function() {
                return this.model.storeUserAnswer();
            },

            // Used by the question view to reset the stored user answer
            resetUserAnswer: function() {
                return this.model.resetUserAnswer();
            },

            // Sets _isCorrect:true/false based upon isCorrect method below
            markQuestion: function() {

                if (this._isInViewOnlyCompatibleMode("isCorrect")) {

                    if (this.isCorrect()) {
                        this.model.set('_isCorrect', true);
                    } else {
                        this.model.set('_isCorrect', false);
                    }

                } else {
                    return this.model.markQuestion();
                }
            },

            // Should return a boolean based upon whether to question is correct or not
            isCorrect: function() {
                return this.model.isCorrect();
            },

            // Used to set the score based upon the _questionWeight
            setScore: function() {
                return this.model.setScore();
            },

            // Updates buttons based upon question state by setting
            // _buttonState on the model which buttonsView listens to
            updateButtons: function() {
                return this.model.updateButtons();
            },

            // Used to setup the correct, incorrect and partly correct feedback
            setupFeedback: function() {

                if (this._isInViewOnlyCompatibleMode("isPartlyCorrect")) {

                    // Use view based feedback where necessary
                    if (this.model.get('_isCorrect')) {
                        this._runModelCompatibleFunction("setupCorrectFeedback");
                    } else if (this.isPartlyCorrect()) {
                        this._runModelCompatibleFunction("setupPartlyCorrectFeedback");
                    } else {
                        this._runModelCompatibleFunction("setupIncorrectFeedback");
                    }

                } else {
                    // Use model based feedback
                    this.model.setupFeedback();
                }

            },

            // Used by the question to determine if the question is incorrect or partly correct
            // Should return a boolean
            isPartlyCorrect: function() {
                return this.model.isPartlyCorrect();
            },

            setupCorrectFeedback: function() {
                return this.model.setupCorrectFeedback();
            },

            setupPartlyCorrectFeedback: function() {
                return this.model.setupPartlyCorrectFeedback();
            },

            setupIncorrectFeedback: function() {
                return this.model.setupIncorrectFeedback();
            },


        //Helper functions for compatibility layer
        _runModelCompatibleFunction: function(name, lookForViewOnlyFunction) {
            if (this._isInViewOnlyCompatibleMode(name, lookForViewOnlyFunction)) {
                return this[name](); //questionView
            } else {
                return this.model[name](); //questionModel
            }
        },

        _isInViewOnlyCompatibleMode: function(name, lookForViewOnlyFunction) {
            //return false uses the model function questionModel
            //return true uses the view only function questionView

            var checkForFunction = (lookForViewOnlyFunction || name);

            //if the function does NOT exist on the view at all, use the model only
            if (!this.constructor.prototype[checkForFunction]) return false; //questionModel

            //if the function DOES exist on the view and MATCHES the compatibility function above, use the model only
            if (this.constructor.prototype[checkForFunction] === viewOnlyCompatibleQuestionView[checkForFunction])  {
                switch (checkForFunction) {
                case "setupFeedback":
                case "markQuestion": 
                    return true; //questionView   
                }
                return false; //questionModel
            }

            //if the function DOES exist on the view and does NOT match the compatibility function above, use the view function
            return true; //questionView
        }

    };
    
    //return question view class extended with the compatibility layer
    return QuestionView.extend(viewOnlyCompatibleQuestionView, {
        _isQuestionType: true
    });

    /*END OF BACKWARDS COMPATIBILITY SECTION*/

});
