define([
  'core/js/adapt',
  'core/js/views/componentView',
  'core/js/views/buttonsView',
  'core/js/models/questionModel',
  'core/js/enums/buttonStateEnum'
], function(Adapt, ComponentView, ButtonsView, QuestionModel, BUTTON_STATE) {

  class QuestionView extends ComponentView {

    className() {
      return [
        'component',
        'is-question',
        this.model.get('_component').toLowerCase(),
        this.model.get('_id'),
        this.model.get('_classes'),
        this.setVisibility(),
        'is-' + this.model.get('_layout'),
        (this.model.get('_isComplete') ? 'is-complete' : ''),
        (this.model.get('_isOptional') ? 'is-optional' : ''),
        (this.model.get('_canShowModelAnswer') ? 'can-show-model-answer' : ''),
        (this.model.get('_canShowFeedback') ? 'can-show-feedback' : ''),
        (this.model.get('_canShowMarking') ? 'can-show-marking' : '')
      ].join(' ');
    }

    preRender() {
      // Setup listener for _isEnabled
      this.listenTo(this.model, 'change:_isEnabled', this.onEnabledChanged);

      this.listenTo(this.model, 'question:refresh', this.refresh);

      // Checks to see if the question should be reset on revisit
      this.checkIfResetOnRevisit();
      // This method helps setup default settings on the model
      this._runModelCompatibleFunction('setupDefaultSettings');
      // Blank method for setting up questions before rendering
      this.setupQuestion();
    }

    // Used in the question view to disabled the question when _isEnabled has been set to false
    onEnabledChanged(model, changedAttribute) {

      // If isEnabled == false add disabled class
      // else remove disabled class
      if (!changedAttribute) {
        this.$('.component__widget').addClass('is-disabled');
        this.disableQuestion();
      } else {
        this.$('.component__widget').removeClass('is-disabled');
        this.enableQuestion();
      }

    }

    // Used by the question to disable the question during submit and complete stages
    disableQuestion() {}

    // Used by the question to enable the question during interactions
    enableQuestion() {}

    // Used to check if the question should reset on revisit
    checkIfResetOnRevisit() {

      let isResetOnRevisit = this.model.get('_isResetOnRevisit');

      // Convert AAT "false" string to boolean
      isResetOnRevisit = (isResetOnRevisit === "false") ?
        false :
        isResetOnRevisit;

      // If reset is enabled set defaults
      // Call blank method for question to handle
      if (isResetOnRevisit) {

        this.model.reset(isResetOnRevisit, true);

        // Defer is added to allow the component to render
        _.defer(() => {
          this.resetQuestionOnRevisit(isResetOnRevisit);
        });

      } else {

        // If complete - display users answer
        // or reset the question if not complete
        const isInteractionComplete = this.model.get('_isInteractionComplete');

        if (isInteractionComplete) {
          this.model.set('_buttonState', BUTTON_STATE.HIDE_CORRECT_ANSWER);
          // Defer is added to allow the component to render
          _.defer(() => {
            this.onHideCorrectAnswerClicked();
          });

        } else {
          this.model.set('_buttonState', BUTTON_STATE.SUBMIT);
          // Defer is added to allow the component to render
          _.defer(() => {
            this.onResetClicked();
          });
        }

      }

    }

    // Used by the question to reset the question when revisiting the component
    resetQuestionOnRevisit(type) {}

    // Left blank for question setup - should be used instead of preRender
    setupQuestion() {}

    // Calls default methods to setup after the question is rendered
    postRender() {
      this.addButtonsView();
      this.onQuestionRendered();
    }

    // Used to setup buttonsView and sets up the internal events for the question
    addButtonsView() {
      this.buttonsView = new ButtonsView({ model: this.model, el: this.$('.btn__container') });

      this.listenTo(this.buttonsView, 'buttons:stateUpdate', this.onButtonStateUpdate);

    }

    onButtonStateUpdate(buttonState) {

      switch (buttonState) {
        case BUTTON_STATE.SUBMIT:
          this.onSubmitClicked();
          break;
        case BUTTON_STATE.RESET:
          this.onResetClicked();
          break;
        case BUTTON_STATE.SHOW_CORRECT_ANSWER:
          this.onShowCorrectAnswerClicked();
          break;
        case BUTTON_STATE.HIDE_CORRECT_ANSWER:
          this.onHideCorrectAnswerClicked();
          break;
        case BUTTON_STATE.SHOW_FEEDBACK:
          this.showFeedback();
          break;
      }

    }

    // Blank method used just like postRender is for presentational components
    onQuestionRendered() {}

    // Triggered when the submit button is clicked
    onSubmitClicked() {
      // canSubmit is setup in questions and should return a boolean
      // If the question stops the user form submitting - show instruction error
      // and give a blank method, onCannotSubmit to the question
      const canSubmit = this._runModelCompatibleFunction('canSubmit');

      if (!canSubmit) {
        this.showInstructionError();
        this.onCannotSubmit();
        return;
      }

      // Used to update the amount of attempts the question has
      this._runModelCompatibleFunction('updateAttempts');

      // Used to set attributes on the model after being submitted
      // Also adds a class of submitted
      this._runModelCompatibleFunction('setQuestionAsSubmitted');

      // Used to remove instruction error that is set when
      // the user has interacted in the wrong way
      this.removeInstructionError();

      // Used to store the users answer for later
      // This is a blank method given to the question
      this._runModelCompatibleFunction('storeUserAnswer');

      // Used to set question as correct:true/false
      // Calls isCorrect which is blank for the question
      // to fill out and return a boolean
      this._runModelCompatibleFunction('markQuestion', 'isCorrect');

      // Used by the question to set the score on the model
      this._runModelCompatibleFunction('setScore');

      // Used to check if the question is complete
      // Triggers setCompletionStatus and adds class to widget
      this._runModelCompatibleFunction('checkQuestionCompletion');

      // Used by the question to display markings on the component
      if (this.model.shouldShowMarking) {
        this.showMarking();
      }

      this.recordInteraction();

      // Used to setup the feedback by checking against
      // question isCorrect or isPartlyCorrect
      this._runModelCompatibleFunction('setupFeedback');

      // Used to trigger an event so plugins can display feedback
      // Do this before updating the buttons so that the focus can be
      // shifted immediately
      this.showFeedback();

      // Force height re-calculations before the submit button
      // becomes disabled.
      $(window).resize();

      // Used to update buttonsView based upon question state
      // Update buttons happens before showFeedback to preserve tabindexes and after setupFeedback to allow buttons to use feedback attribute
      this._runModelCompatibleFunction('updateButtons');

      this.model.onSubmitted();
      this.onSubmitted();
    }

    showInstructionError() {
      Adapt.trigger('questionView:showInstructionError', this);
    }

    // Blank method for question to fill out when the question cannot be submitted
    onCannotSubmit() {}

    // Blank method for question to fill out when the question was successfully submitted
    onSubmitted() {}

    // Used to set _isEnabled and _isSubmitted on the model
    // Also adds a 'submitted' class to the widget
    setQuestionAsSubmitted() {
      this.model.setQuestionAsSubmitted();
      this.$('.component__widget').addClass('is-submitted');
    }

    // Removes validation error class when the user canSubmit
    removeInstructionError() {
      this.$('.component__instruction-inner').removeClass('validation-error');
    }

    // This is important and should give the user feedback on how they answered the question
    // Normally done through ticks and crosses by adding classes
    showMarking() {}

    // Checks if the question should be set to complete
    // Calls setCompletionStatus and adds complete classes
    checkQuestionCompletion() {

      const isComplete = this.model.checkQuestionCompletion();

      if (isComplete) {
        this.$('.component__widget').addClass('is-complete show-user-answer');
      }

    }

    recordInteraction() {
      if (this.model.get('_recordInteraction') === true || !this.model.has('_recordInteraction')) {
        Adapt.trigger('questionView:recordInteraction', this);
      }
    }

    // Used to show feedback based upon whether _canShowFeedback is true
    showFeedback() {

      if (this.model.get('_canShowFeedback')) {
        Adapt.trigger('questionView:showFeedback', this);
      } else {
        Adapt.trigger('questionView:disabledFeedback', this);
      }

    }

    onResetClicked() {
      this.setQuestionAsReset();

      this._runModelCompatibleFunction('resetUserAnswer');

      this.resetQuestion();

      this.model.checkCanSubmit();

      this._runModelCompatibleFunction('updateButtons');

      // onResetClicked is called as part of the checkIfResetOnRevisit
      // function and as a button click. if the view is already rendered,
      // then the button was clicked, focus on the first tabbable element
      if (!this.model.get('_isReady')) return;
      // Attempt to get the current page location
      const currentModel = Adapt.findById(Adapt.location._currentId);
      // Make sure the page is ready
      if (!currentModel || !currentModel.get('_isReady')) return;
      // Focus on the first readable item in this element
      Adapt.a11y.focusNext(this.$el);

    }

    setQuestionAsReset() {
      this.model.setQuestionAsReset();
      this.$('.component__widget').removeClass('is-submitted');
    }

    // Used by the question view to reset the look and feel of the component.
    // This could also include resetting item data
    // This is triggered when the reset button is clicked so it shouldn't
    // be a full reset
    resetQuestion() {}

    refresh() {
      this.model.set('_buttonState', this.model.getButtonState());

      if (this.model.shouldShowMarking && this.model.get('_isSubmitted')) {
        this.showMarking();
      }

      if (this.buttonsView) {
        _.defer(this.buttonsView.refresh.bind(this.buttonsView));
      }
    }

    onShowCorrectAnswerClicked() {
      this.setQuestionAsShowCorrect();

      this._runModelCompatibleFunction('updateButtons');

      this.showCorrectAnswer();
    }

    setQuestionAsShowCorrect() {
      this.$('.component__widget')
        .addClass('is-submitted show-correct-answer')
        .removeClass('show-user-answer');
    }

    // Used by the question to display the correct answer to the user
    showCorrectAnswer() {}

    onHideCorrectAnswerClicked() {
      this.setQuestionAsHideCorrect();

      this._runModelCompatibleFunction('updateButtons');

      this.hideCorrectAnswer();
    }

    setQuestionAsHideCorrect() {
      this.$('.component__widget')
        .addClass('is-submitted show-user-answer')
        .removeClass('show-correct-answer');
    }

    // Used by the question to display the users answer and
    // hide the correct answer
    // Should use the values stored in storeUserAnswer
    hideCorrectAnswer() {}

    // Time elapsed between the time the interaction was made available to the learner for response and the time of the first response
    getLatency() {
      return null;
    }

    // This function is overridden if useQuestionModeOnly: false. see below.
    _runModelCompatibleFunction(name, lookForViewOnlyFunction) {
      return this.model[name](); // questionModel Only
    }
  }

  QuestionView._isQuestionType = true;

  /* BACKWARDS COMPATIBILITY SECTION
  * This section below is only for compatibility between the separated questionView+questionModel and the old questionView
  * Remove this section in when all components use questionModel and there is no need to have model behaviour in the questionView
  */

  class ViewOnlyQuestionViewCompatibilityLayer extends QuestionView {

    /* All of these functions have been moved to the questionModel.js file.
     * On the rare occasion that they have not been overridden by the component and
            that they call the view only questionView version,
            these functions are included as redirects to the new Question Model.
            It is very unlikely that these are needed but they are included to ensure compatibility.
     * If you need to override these in your component you should now make and register a component model.
     * Please remove them from your question component's view.
    */

    // Returns an object specific to the question type.
    getInteractionObject() {
      Adapt.log.deprecated('QuestionView.getInteractionObject, please use QuestionModel.getInteractionObject');
      return this.model.getInteractionObject();
    }

    // Retturns a string detailing how the user answered the question.
    getResponse() {
      Adapt.log.deprecated('QuestionView.getInteractionObject, please use QuestionModel.getInteractionObject');
      return this.model.getResponse();
    }

    // Returns a string describing the type of interaction: "choice" and "matching" supported (see scorm wrapper)
    getResponseType() {
      Adapt.log.deprecated('QuestionView.getResponseType, please use QuestionModel.getResponseType');
      return this.model.getResponseType();
    }

    // Calls default methods to setup on questions
    setupDefaultSettings() {
      Adapt.log.deprecated('QuestionView.setupDefaultSettings, please use QuestionModel.setupDefaultSettings');
      return this.model.setupDefaultSettings();
    }

    // Used to setup either global or local button text
    setupButtonSettings() {
      Adapt.log.deprecated('QuestionView.setupButtonSettings, please use QuestionModel.setupButtonSettings');
      return this.model.setupButtonSettings();
    }

    // Used to setup either global or local question weight/score
    setupWeightSettings() {
      Adapt.log.deprecated('QuestionView.setupWeightSettings, please use QuestionModel.setupWeightSettings');
      return this.model.setupWeightSettings();
    }

    // Use to check if the user is allowed to submit the question
    // Maybe the user has to select an item?
    canSubmit() {
      Adapt.log.deprecated('QuestionView.canSubmit, please use QuestionModel.canSubmit');
      return this.model.canSubmit();
    }

    // Used to update the amount of attempts the user has left
    updateAttempts() {
      Adapt.log.deprecated('QuestionView.updateAttempts, please use QuestionModel.updateAttempts');
      return this.model.updateAttempts();
    }

    // This is important for returning or showing the users answer
    // This should preserve the state of the users answers
    storeUserAnswer() {
      Adapt.log.deprecated('QuestionView.storeUserAnswer, please use QuestionModel.storeUserAnswer');
      return this.model.storeUserAnswer();
    }

    // Used by the question view to reset the stored user answer
    resetUserAnswer() {
      Adapt.log.deprecated('QuestionView.resetUserAnswer, please use QuestionModel.resetUserAnswer');
      return this.model.resetUserAnswer();
    }

    // Sets _isCorrect:true/false based upon isCorrect method below
    markQuestion() {

      if (this._isInViewOnlyCompatibleMode('isCorrect')) {

        if (this.isCorrect()) {
          this.model.set('_isCorrect', true);
        } else {
          this.model.set('_isCorrect', false);
        }

      } else {
        return this.model.markQuestion();
      }
    }

    // Should return a boolean based upon whether to question is correct or not
    isCorrect() {
      Adapt.log.deprecated('QuestionView.isCorrect, please use QuestionModel.isCorrect');
      return this.model.isCorrect();
    }

    // Used to set the score based upon the _questionWeight
    setScore() {
      Adapt.log.deprecated('QuestionView.setScore, please use QuestionModel.setScore');
      return this.model.setScore();
    }

    // Updates buttons based upon question state by setting
    // _buttonState on the model which buttonsView listens to
    updateButtons() {
      Adapt.log.deprecated('QuestionView.updateButtons, please use QuestionModel.updateButtons');
      return this.model.updateButtons();
    }

    // Used to setup the correct, incorrect and partly correct feedback
    setupFeedback() {

      if (this._isInViewOnlyCompatibleMode('isPartlyCorrect')) {

        // Use view based feedback where necessary
        if (this.model.get('_isCorrect')) {
          this._runModelCompatibleFunction('setupCorrectFeedback');
        } else if (this.isPartlyCorrect()) {
          this._runModelCompatibleFunction('setupPartlyCorrectFeedback');
        } else {
          this._runModelCompatibleFunction('setupIncorrectFeedback');
        }

      } else {
        // Use model based feedback
        this.model.setupFeedback();
      }

    }

    // Used by the question to determine if the question is incorrect or partly correct
    // Should return a boolean
    isPartlyCorrect() {
      Adapt.log.deprecated('QuestionView.isPartlyCorrect, please use QuestionModel.isPartlyCorrect');
      return this.model.isPartlyCorrect();
    }

    setupCorrectFeedback() {
      Adapt.log.deprecated('QuestionView.setupCorrectFeedback, please use QuestionModel.setupCorrectFeedback');
      return this.model.setupCorrectFeedback();
    }

    setupPartlyCorrectFeedback() {
      Adapt.log.deprecated('QuestionView.setupPartlyCorrectFeedback, please use QuestionModel.setupPartlyCorrectFeedback');
      return this.model.setupPartlyCorrectFeedback();
    }

    setupIncorrectFeedback() {
      Adapt.log.deprecated('QuestionView.setupIncorrectFeedback, please use QuestionModel.setupIncorrectFeedback');
      return this.model.setupIncorrectFeedback();
    }

    // Helper functions for compatibility layer
    _runModelCompatibleFunction(name, lookForViewOnlyFunction) {
      if (this._isInViewOnlyCompatibleMode(name, lookForViewOnlyFunction)) {
        return this[name](); // questionView
      } else {
        return this.model[name](); // questionModel
      }
    }

    _isInViewOnlyCompatibleMode(name, lookForViewOnlyFunction) {
      // return false uses the model function questionModel
      // return true uses the view only function questionView

      const checkForFunction = (lookForViewOnlyFunction || name);

      // if the function does NOT exist on the view at all, use the model only
      if (!this.constructor.prototype[checkForFunction]) return false; // questionModel

      // if the function DOES exist on the view and MATCHES the compatibility function above, use the model only
      const hasCompatibleVersion = (ViewOnlyQuestionViewCompatibilityLayer.prototype.hasOwnProperty(checkForFunction));
      const usingCompatibleVersion = (this.constructor.prototype[checkForFunction] === ViewOnlyQuestionViewCompatibilityLayer.prototype[checkForFunction]);
      if (hasCompatibleVersion && usingCompatibleVersion) {
        switch (checkForFunction) {
          case 'setupFeedback':
          case 'markQuestion':
            return true; // questionView
        }
        return false; // questionModel
      }

      // if the function DOES exist on the view and does NOT match the compatibility function above, use the view function
      return true; // questionView
    }

  };

  // return question view class extended with the compatibility layer
  return ViewOnlyQuestionViewCompatibilityLayer;

  /* END OF BACKWARDS COMPATIBILITY SECTION */

});
