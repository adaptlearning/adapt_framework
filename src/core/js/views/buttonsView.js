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
    const template = Handlebars.templates['buttons'];
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

    if (!isSubmitted) {
      this.$('.js-btn-marking').removeClass('is-incorrect is-correct').addClass('u-display-none');
      this.$el.removeClass('is-submitted');
      this.model.set('feedbackMessage', undefined);
      Adapt.a11y.toggleEnabled(this.$('.js-btn-feedback'), false);
    } else {
      this.$el.addClass('is-submitted');
    }
  }

  onActionClicked() {
    const buttonState = this.model.get('_buttonState');
    this.trigger('buttons:stateUpdate', BUTTON_STATE(buttonState));
    this.checkResetSubmittedState();
  }

  onFeedbackClicked() {
    this.trigger('buttons:stateUpdate', BUTTON_STATE.SHOW_FEEDBACK);
  }

  onFeedbackMessageChanged(model, changedAttribute) {
    if (changedAttribute && this.model.get('_canShowFeedback')) {
      // enable feedback button
      Adapt.a11y.toggleEnabled(this.$('.js-btn-feedback'), true);
    } else {
      // disable feedback button
      Adapt.a11y.toggleEnabled(this.$('.js-btn-feedback'), false);
    }
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

    } else {

      const propertyName = textPropertyName[buttonState.asString];
      const ariaLabel = this.model.get('_buttons')['_' + propertyName].ariaLabel;
      const buttonText = this.model.get('_buttons')['_' + propertyName].buttonText;

      // Enable the button, make accessible and update aria labels and text

      Adapt.a11y.toggleEnabled($buttonsAction, this.model.get('_canSubmit'));
      $buttonsAction.html(buttonText).attr('aria-label', ariaLabel);

      // Make model answer button inaccessible (but still enabled) for visual users due to
      // the inability to represent selected incorrect/correct answers to a screen reader, may need revisiting
      switch (changedAttribute) {
        case BUTTON_STATE.SHOW_CORRECT_ANSWER:
        case BUTTON_STATE.HIDE_CORRECT_ANSWER:

          Adapt.a11y.toggleAccessible($buttonsAction, false);
      }

    }
  }

  checkFeedbackState() {
    const canShowFeedback = this.model.get('_canShowFeedback');

    this.$('.js-btn-action').toggleClass('is-full-width', !canShowFeedback);
    this.$('.js-btn-feedback').toggleClass('u-display-none', !canShowFeedback);
    this.$('.js-btn-marking').toggleClass('is-full-width u-display-none', !canShowFeedback);
  }

  updateAttemptsCount(model, changedAttribute) {
    const isInteractionComplete = this.model.get('_isInteractionComplete');
    const attemptsLeft = (this.model.get('_attemptsLeft')) ? this.model.get('_attemptsLeft') : this.model.get('_attempts');
    const shouldDisplayAttempts = this.model.get('_shouldDisplayAttempts');
    let attemptsString;

    this.checkResetSubmittedState();

    if (!isInteractionComplete && attemptsLeft !== 0) {
      attemptsString = attemptsLeft + ' ';
      if (attemptsLeft > 1) {
        attemptsString += this.model.get('_buttons').remainingAttemptsText;
      } else if (attemptsLeft === 1) {
        attemptsString += this.model.get('_buttons').remainingAttemptText;
      }

    } else {
      this.$('.js-display-attempts').addClass('u-visibility-hidden');
      this.showMarking();
    }

    if (shouldDisplayAttempts) {
      this.$('.js-insert-attempts-string').html(attemptsString);
    }

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
