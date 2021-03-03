import Adapt from 'core/js/adapt';
import BUTTON_STATE from 'core/js/enums/buttonStateEnum';

// convert BUTTON_STATE to property name
const textPropertyName = {
  'SUBMIT': 'submit',
  'CORRECT': 'correct',
  'INCORRECT': 'incorrect',
  'SHOW_CORRECT_ANSWER': 'showCorrectAnswer',
  'HIDE_CORRECT_ANSWER': 'hideCorrectAnswer',
  'SHOW_FEEDBACK': 'showFeedback',
  'RESET': 'reset'
};

export default class ButtonsView extends Backbone.View {

  initialize(options) {
    this.parent = options.parent;
    this.listenTo(Adapt.parentView, 'postRemove', this.remove);
    this.listenTo(this.model, {
      'change:_buttonState': this.onButtonStateChanged,
      'change:feedbackMessage': this.onFeedbackMessageChanged,
      'change:_attemptsLeft': this.onAttemptsChanged,
      'change:_canSubmit': this.onCanSubmitChange
    });
    this.render();
  }

  events() {
    return {
      'click .js-btn-action': 'onActionClicked',
      'click .js-btn-feedback': 'onFeedbackClicked'
    };
  }

  render() {
    const data = this.model.toJSON();
    const template = Handlebars.templates.buttons;
    _.defer(() => {
      this.postRender();
      Adapt.trigger('buttonsView:postRender', this);
    });
    this.$el.html(template(data));
  }

  postRender() {
    this.refresh();
  }

  checkResetSubmittedState() {
    const isSubmitted = this.model.get('_isSubmitted');
    if (isSubmitted) {
      this.$el.addClass('is-submitted');
      return;
    }

    this.$('.js-btn-marking').removeClass('is-incorrect is-correct').addClass('u-display-none');
    this.$el.removeClass('is-submitted');
    this.model.set('feedbackMessage', undefined);
    Adapt.a11y.toggleEnabled(this.$('.js-btn-feedback'), false);
  }

  onActionClicked() {
    const buttonState = BUTTON_STATE(this.model.get('_buttonState'));
    this.trigger('buttons:stateUpdate', buttonState);
    this.checkResetSubmittedState();

    if (buttonState === BUTTON_STATE.SHOW_CORRECT_ANSWER) {
      const correctAnswer = this.model.getCorrectAnswerAsText?.();
      this.updateAnswerLiveRegion(correctAnswer);
    }

    if (buttonState === BUTTON_STATE.HIDE_CORRECT_ANSWER) {
      const userAnswer = this.model.getUserAnswerAsText?.();
      this.updateAnswerLiveRegion(userAnswer);
    }
  }

  onFeedbackClicked() {
    this.trigger('buttons:stateUpdate', BUTTON_STATE.SHOW_FEEDBACK);
  }

  onFeedbackMessageChanged(model, changedAttribute) {
    if (changedAttribute && this.model.get('_canShowFeedback')) {
      // enable feedback button
      Adapt.a11y.toggleEnabled(this.$('.js-btn-feedback'), true);
      return;
    }
    // disable feedback button
    Adapt.a11y.toggleEnabled(this.$('.js-btn-feedback'), false);
  }

  onCanSubmitChange() {
    this.onButtonStateChanged(this.model, this.model.get('_buttonState'));
  }

  onButtonStateChanged(model, changedAttribute) {

    this.updateAttemptsCount();

    // Use 'correct' instead of 'complete' to signify button state
    const $buttonsAction = this.$('.js-btn-action');
    const buttonState = BUTTON_STATE(changedAttribute);
    if (changedAttribute === BUTTON_STATE.CORRECT || changedAttribute === BUTTON_STATE.INCORRECT) {
      // Both 'correct' and 'incorrect' states have no model answer, so disable the submit button
      Adapt.a11y.toggleEnabled($buttonsAction, false);
      return;
    }

    const propertyName = textPropertyName[buttonState.asString];
    const ariaLabel = this.model.get('_buttons')['_' + propertyName].ariaLabel;
    const buttonText = this.model.get('_buttons')['_' + propertyName].buttonText;

    // Enable the button, make accessible and update aria labels and text
    Adapt.a11y.toggleEnabled($buttonsAction, this.model.get('_canSubmit'));
    $buttonsAction.html(buttonText).attr('aria-label', ariaLabel);
  }

  checkFeedbackState() {
    const canShowFeedback = this.model.get('_canShowFeedback');

    this.$('.js-btn-action').toggleClass('is-full-width', !canShowFeedback);
    this.$('.js-btn-feedback').toggleClass('u-display-none', !canShowFeedback);
    this.$('.js-btn-marking').toggleClass('is-full-width u-display-none', !canShowFeedback);
  }

  updateAttemptsCount() {
    const isInteractionComplete = this.model.get('_isInteractionComplete');
    const attemptsLeft = (this.model.get('_attemptsLeft')) ? this.model.get('_attemptsLeft') : this.model.get('_attempts');
    const shouldDisplayAttempts = this.model.get('_shouldDisplayAttempts');
    let attemptsString;

    this.checkResetSubmittedState();

    if (!isInteractionComplete && attemptsLeft !== 0) {
      attemptsString = attemptsLeft + ' ';
      attemptsString += attemptsLeft === 1 ?
        this.model.get('_buttons').remainingAttemptText :
        this.model.get('_buttons').remainingAttemptsText;
    } else {
      this.$('.js-display-attempts').addClass('u-visibility-hidden');
      this.showMarking();
    }

    if (shouldDisplayAttempts) {
      this.$('.js-insert-attempts-string').html(attemptsString);
    }

  }

  /**
   * Updates the ARIA 'live region' with the correct/user answer when that button
   * is selected by the learner.
   * @param {string} answer Textual representation of the correct/user answer
   */
  updateAnswerLiveRegion(answer) {
    if (!answer) return;
    this.$('.js-answer-live-region').html(answer);
  }

  showMarking() {
    if (!this.model.shouldShowMarking) return;

    const isCorrect = this.model.get('_isCorrect');
    const ariaLabels = Adapt.course.get('_globals')._accessibility._ariaLabels;

    this.$('.js-btn-marking')
      .removeClass('u-display-none')
      .addClass(isCorrect ? 'is-correct' : 'is-incorrect')
      .attr('aria-label', isCorrect ? ariaLabels.answeredCorrectly : ariaLabels.answeredIncorrectly);
  }

  refresh() {
    this.updateAttemptsCount();
    this.checkResetSubmittedState();
    this.checkFeedbackState();
    this.onButtonStateChanged(null, this.model.get('_buttonState'));
    this.onFeedbackMessageChanged(null, this.model.get('feedbackMessage'));
  }

}
