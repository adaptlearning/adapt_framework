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
      'click .js-btn-action': 'onActionClicked',
      'click .js-btn-feedback': 'onFeedbackClicked'
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

        var $icon = this.$('.btn__marking');
        $icon.removeClass('icon-cross');
        $icon.removeClass('icon-tick');
        $icon.addClass('u-display-none');
        this.$el.removeClass("is-submitted");
        this.model.set('feedbackMessage', undefined);
        this.$('.js-btn-feedback').a11y_cntrl_enabled(false);

      } else {

        this.$el.addClass("is-submitted");

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
        this.$('.btn__feedback').a11y_cntrl_enabled(true);
      } else {
        //disable feedback button
        this.$('.btn__feedback').a11y_cntrl_enabled(false);
      }
    },

    onButtonStateChanged: function(model, changedAttribute) {

      this.updateAttemptsCount();

      // Use 'correct' instead of 'complete' to signify button state
      var $buttonsAction = this.$('.btn__action');
      var buttonState = BUTTON_STATE(changedAttribute);
      if (changedAttribute === BUTTON_STATE.CORRECT || changedAttribute === BUTTON_STATE.INCORRECT) {
        // Both 'correct' and 'incorrect' states have no model answer, so disable the submit button

        $buttonsAction.a11y_cntrl_enabled(false);

      } else {

        var propertyName = textPropertyName[buttonState.asString];
        var ariaLabel = this.model.get('_buttons')["_" + propertyName].ariaLabel;
        var buttonText = this.model.get('_buttons')["_" + propertyName].buttonText;

        // Enable the button, make accessible and update aria labels and text
        $buttonsAction.a11y_cntrl_enabled(true).html(buttonText).attr('aria-label', ariaLabel);

        // Make model answer button inaccessible (but still enabled) for visual users due to
        // the inability to represent selected incorrect/correct answers to a screen reader, may need revisiting
        switch (changedAttribute) {
          case BUTTON_STATE.SHOW_CORRECT_ANSWER:
          case BUTTON_STATE.HIDE_CORRECT_ANSWER:

            $buttonsAction.a11y_cntrl(false);
        }

      }
    },

    checkFeedbackState: function(){
      var canShowFeedback = this.model.get('_canShowFeedback');

      this.$('.btn__action').toggleClass('btn__action-fullwidth btn__action-enlarge', !canShowFeedback);
      this.$('.btn__feedback').toggleClass('no-feedback', !canShowFeedback);
      this.$('.btn__marking').toggleClass('no-feedback', !canShowFeedback);
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
        this.$('.js-display-attempts').addClass('u-visibility-hidden');
        this.showMarking();
      }

      if (shouldDisplayAttempts) {
        this.$('.js-insert-attempts-string').html(attemptsString);
      }

    },

    showMarking: function() {
      if (!this.model.get('_canShowMarking')) return;

      var isCorrect = this.model.get('_isCorrect');
      var ariaLabels = Adapt.course.get('_globals')._accessibility._ariaLabels;

      this.$('.btn__marking')
          .removeClass('u-display-none')
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
