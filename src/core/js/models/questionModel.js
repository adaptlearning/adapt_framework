define([
  'core/js/adapt',
  'core/js/models/componentModel',
  'core/js/enums/buttonStateEnum'
], function(Adapt, ComponentModel, BUTTON_STATE) {

  class QuestionModel extends ComponentModel {

    /// ///
    // Setup question types
    /// /

    // Used to set model defaults
    defaults() {
      // Extend from the ComponentModel defaults
      return ComponentModel.resultExtend('defaults', {
        _isQuestionType: true,
        _shouldDisplayAttempts: false,
        _canShowModelAnswer: true,
        _canShowFeedback: true,
        _canShowMarking: true,
        _canSubmit: true,
        _isSubmitted: false,
        _questionWeight: Adapt.config.get('_questionWeight'),
        _items: []
      });
    }

    // Extend from the ComponentModel trackable
    trackable() {
      return ComponentModel.resultExtend('trackable', [
        '_isSubmitted',
        '_score',
        '_isCorrect',
        '_attemptsLeft',
        '_attemptStates'
      ]);
    }

    trackableType() {
      return ComponentModel.resultExtend('trackableType', [
        Boolean,
        Number,
        Boolean,
        Number,
        Array
      ]);
    }

    /**
     * Returns a string of the model type group.
     * @returns {string}
     */
    getTypeGroup() {
      return 'question';
    }

    init() {
      this.setupDefaultSettings();
      if (Adapt.get('_isStarted')) {
        this.onAdaptInitialize();
        return;
      }
      this.listenToOnce(Adapt, 'adapt:initialize', this.onAdaptInitialize);
      this.setLocking('_canSubmit', true);
    }

    // Calls default methods to setup on questions
    setupDefaultSettings() {
      // Not sure this is needed anymore, keeping to maintain API
      this.setupWeightSettings();
      this.setupButtonSettings();
    }

    // Used to setup either global or local button text
    setupButtonSettings() {
      const globalButtons = Adapt.course.get('_buttons');

      // Check if  '_buttons' attribute exists and if not use the globally defined buttons.
      if (!this.has('_buttons')) {
        this.set('_buttons', globalButtons);
      } else {
        // Check all the components buttons.
        // If they are empty use the global defaults.
        const componentButtons = this.get('_buttons');

        for (let key in componentButtons) {
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
    }

    // Used to setup either global or local question weight/score
    setupWeightSettings() {
      // Not needed as handled by model defaults, keeping to maintain API
    }

    /// ///
    // Selection restoration process
    /// /

    // Used to add post-load changes to the model
    onAdaptInitialize() {
      this.restoreUserAnswers();
    }

    // Used to restore the user answers
    restoreUserAnswers() {}

    /// ///
    // Submit process
    /// /

    // Use to check if the user is allowed to submit the question
    // Maybe the user has to select an item?
    canSubmit() {}

    checkCanSubmit() {
      this.set('_canSubmit', this.canSubmit(), { pluginName: 'adapt' });
    }

    // Used to update the amount of attempts the user has left
    updateAttempts() {
      if (!this.get('_attemptsLeft')) {
        this.set('_attemptsLeft', this.get('_attempts'));
      }
      this.set('_attemptsLeft', this.get('_attemptsLeft') - 1);
    }

    // Used to set _isEnabled and _isSubmitted on the model
    setQuestionAsSubmitted() {
      this.set({
        _isEnabled: false,
        _isSubmitted: true
      });
    }

    // This is important for returning or showing the users answer
    // This should preserve the state of the users answers
    storeUserAnswer() {}

    // Sets _isCorrect:true/false based upon isCorrect method below
    markQuestion() {

      if (this.isCorrect()) {
        this.set('_isCorrect', true);
      } else {
        this.set('_isCorrect', false);
      }

    }

    // Should return a boolean based upon whether to question is correct or not
    isCorrect() {}

    // Used to set the score based upon the _questionWeight
    setScore() {}

    // Checks if the question should be set to complete
    // Calls setCompletionStatus and adds complete classes
    checkQuestionCompletion() {

      const isComplete = (this.get('_isCorrect') || this.get('_attemptsLeft') === 0);

      if (isComplete) {
        this.setCompletionStatus();
      }

      return isComplete;

    }

    // Updates buttons based upon question state by setting
    // _buttonState on the model which buttonsView listens to
    updateButtons() {

      const isInteractionComplete = this.get('_isInteractionComplete');
      const isCorrect = this.get('_isCorrect');
      const isEnabled = this.get('_isEnabled');
      const buttonState = this.get('_buttonState');
      const canShowModelAnswer = this.get('_canShowModelAnswer');

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

    }

    // Used to setup the correct, incorrect and partly correct feedback
    setupFeedback() {
      if (!this.has('_feedback')) return;

      if (this.get('_isCorrect')) {
        this.setupCorrectFeedback();
      } else if (this.isPartlyCorrect()) {
        this.setupPartlyCorrectFeedback();
      } else {
        this.setupIncorrectFeedback();
      }
    }

    // Used by the question to determine if the question is incorrect or partly correct
    // Should return a boolean
    isPartlyCorrect() {}

    setupCorrectFeedback() {
      this.set({
        feedbackTitle: this.getFeedbackTitle(),
        feedbackMessage: this.get('_feedback').correct
      });
    }

    setupPartlyCorrectFeedback() {
      const feedback = this.get('_feedback')._partlyCorrect;

      if (feedback && feedback.final) {
        this.setAttemptSpecificFeedback(feedback);
      } else {
        this.setupIncorrectFeedback();
      }
    }

    setupIncorrectFeedback() {
      this.setAttemptSpecificFeedback(this.get('_feedback')._incorrect);
    }

    setAttemptSpecificFeedback(feedback) {
      const body = (this.get('_attemptsLeft') && feedback.notFinal) || feedback.final;

      this.set({
        feedbackTitle: this.getFeedbackTitle(),
        feedbackMessage: body
      });
    }

    getFeedbackTitle() {
      return this.get('_feedback').title || this.get('displayTitle') || this.get('title') || '';
    }

    /**
     * Used to determine whether the learner is allowed to interact with the question component or not.
     * @return {Boolean}
     */
    isInteractive() {
      return !this.get('_isComplete') || (this.get('_isEnabled') && !this.get('_isSubmitted'));
    }

    // Reset the model to let the user have another go (not the same as attempts)
    reset(type, force) {
      if (!this.get('_canReset') && !force) return;

      type = type || true; // hard reset by default, can be "soft", "hard"/true

      super.reset(type, force);

      const attempts = this.get('_attempts');
      this.set({
        _attemptsLeft: attempts,
        _isCorrect: undefined,
        _isSubmitted: false,
        _buttonState: BUTTON_STATE.SUBMIT
      });
    }

    // Reset question for subsequent attempts
    setQuestionAsReset() {
      this.set({
        _isEnabled: true,
        _isSubmitted: false
      });
    }

    // Used by the question view to reset the stored user answer
    resetUserAnswer() {}

    refresh() {
      this.trigger('question:refresh');
    }

    getButtonState() {
      if (this.get('_isCorrect')) {
        return BUTTON_STATE.CORRECT;
      }

      if (this.get('_attemptsLeft') === 0) {
        return this.get('_canShowModelAnswer') ? BUTTON_STATE.SHOW_CORRECT_ANSWER : BUTTON_STATE.INCORRECT;
      }

      return this.get('_isSubmitted') ? BUTTON_STATE.RESET : BUTTON_STATE.SUBMIT;
    }

    // Returns an object specific to the question type, e.g. if the question
    // is a 'choice' this should contain an object with:
    // - correctResponsesPattern[]
    // - choices[]
    getInteractionObject() {
      return {};
    }

    // Returns a string detailing how the user answered the question.
    getResponse() {}

    // Returns a string describing the type of interaction: "choice" and "matching" supported (see scorm wrapper)
    getResponseType() {}

    /**
     * Called at the end of the onSubmitClicked view function.
     */
    onSubmitted() {
      // Stores the current attempt state
      this.addAttemptObject();
    }

    /** @type {boolean} */
    get shouldShowMarking() {
      if (!this.get('_canShowMarking')) {
        return false;
      }

      return this.get('_isInteractionComplete');
    }

    /**
     * Returns the current attempt state raw data or the raw data from the supplied attempt state object.
     * @param {Object} [object] JSON object representing the component state. Defaults to current JSON.
     * @returns {Array}
     */
    getAttemptState(object = this.toJSON()) {
      const trackables = this.trackable();
      const types = this.trackableType();
      trackables.find((name, index) => {
        // Exclude _attemptStates as it's trackable but isn't needed here
        if (name !== '_attemptStates') return;
        trackables.splice(index, 1);
        types.splice(index, 1);
        return true;
      });
      const values = trackables.map(n => object[n]);
      const booleans = values.filter((v, i) => types[i] === Boolean).map(Boolean);
      const numbers = values.filter((v, i) => types[i] === Number).map(v => Number(v) || 0);
      const arrays = values.filter((v, i) => types[i] === Array);
      return [
        numbers,
        booleans,
        arrays
      ];
    }

    /**
     * Returns an attempt object representing the current state or a formatted version of the raw state object supplied.
     * @param {Array} [state] JSON object representing the component state, defaults to current state returned from getAttemptState().
     * @returns {Object}
     */
    getAttemptObject(state = this.getAttemptState()) {
      const trackables = this.trackable();
      const types = this.trackableType();
      trackables.find((name, index) => {
        // Exclude _attemptStates as it's trackable but isn't needed here
        if (name !== '_attemptStates') return;
        trackables.splice(index, 1);
        types.splice(index, 1);
        return true;
      });
      const numbers = (state[0] || []).slice(0);
      const booleans = (state[1] || []).slice(0);
      const arrays = (state[2] || []).slice(0);
      const object = {};
      trackables.forEach((n, i) => {
        if (n === '_id') return;
        switch (types[i]) {
          case Number:
            object[n] = numbers.shift();
            break;
          case Boolean:
            object[n] = booleans.shift();
            break;
          case Array:
            object[n] = arrays.shift();
            break;
        }
      });
      return object;
    }

    /**
     * Sets the current attempt state from the supplied attempt state object.
     * @param {Object} object JSON object representing the component state.
     * @param {boolean} silent Stops change events from triggering
     */
    setAttemptObject(object, silent = true) {
      this.set(object, { silent });
    }

    /**
     * Adds the current attempt state object or the supplied state object to the attempts store.
     * @param {Object} [object] JSON object representing the component state. Defaults to current JSON.
     */
    addAttemptObject(object = this.getAttemptObject()) {
      const attemptStates = this.get('_attemptStates') || [];
      const state = this.getAttemptState(object);
      attemptStates.push(state);
      this.set('_attemptStates', attemptStates);
    }

    /**
     * Returns an array of the previous state objects. The most recent state is last in the list.
     * @returns {Array}
     */
    getAttemptObjects() {
      const states = this.get('_attemptStates') || [];
      return states.map(state => this.getAttemptObject(state));
    }

  }

  return QuestionModel;

});
