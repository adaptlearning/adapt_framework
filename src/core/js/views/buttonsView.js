define(function() {

    var Adapt = require('coreJS/adapt');

    var ButtonsView = Backbone.View.extend({

        initialize: function() {
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
            this.updateAttemptsCount();
            this.checkResetSubmittedState();
            this.onButtonStateChanged(null, this.model.get('_buttonState'));
            this.onFeedbackMessageChanged(null, this.model.get('feedbackMessage'));
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
            this.trigger('buttons:' + buttonState);
            this.checkResetSubmittedState();
        },

        onFeedbackClicked: function() {
            this.trigger('buttons:showFeedback');
        },

        onFeedbackMessageChanged: function(model, changedAttribute) {
            if (changedAttribute && this.model.get('_canShowFeedback')) {
				//enable feedback button
                this.$('.buttons-feedback').a11y_cntrl_enabled(true);
            } else {
				//disable feedback button
                this.$('.buttons-feedback').a11y_cntrl_enabled(false)
            }
        },

        onButtonStateChanged: function(model, changedAttribute) {
			//use correct instead of complete to signify button state
            if (changedAttribute === 'correct') {
				//disable submit button on correct (i.e. no model answer)
                this.$('.buttons-action').a11y_cntrl_enabled(false);

                if (!this.model.get("_canShowFeedback")) {
                    if (!this.$el.is(".no-state")) {
                        //if no feedback, complete correct and has state, force focus to component state
                        _.defer(_.bind(function() {
                            $("." + this.model.get("_id") + " .accessibility-state [tabindex]").focusNoScroll();
                        }, this));
                    }
                }

            } else {
                // Backwords compatibility with v1.x
                var ariaLabel = this.model.get('_buttons')["_" + changedAttribute].ariaLabel;
                var buttonText = this.model.get('_buttons')["_" + changedAttribute].buttonText;

                switch (changedAttribute) {
                    case "showCorrectAnswer": case "hideCorrectAnswer":
    				    //make model answer button inaccessible but enabled for visual users
    				    //	due to inability to represent selected incorrect/correct answers to a screen reader, may need revisiting
                        this.$('.buttons-action').a11y_cntrl(false).html(buttonText).attr('aria-label', ariaLabel);
                        break;
                    default:
    				    //enabled button, make accessible and update aria labels and text.
                        this.$('.buttons-action').a11y_cntrl_enabled(true).html(buttonText).attr('aria-label', ariaLabel);
                }
            }

            this.updateAttemptsCount();
        },

        updateAttemptsCount: function(model, changedAttribute) {
            var isInteractionComplete = this.model.get('_isInteractionComplete');
            var attemptsLeft = (this.model.get('_attemptsLeft')) ? this.model.get('_attemptsLeft') : this.model.get('_attempts')
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
                var $icon = this.$('.buttons-marking-icon').removeClass('display-none');
                if (isCorrect) {
                    $icon.addClass('icon-tick');
                } else {
                    $icon.addClass('icon-cross');
                }
            }

            if (shouldDisplayAttempts) {
                this.$('.buttons-display-inner').html(attemptsString);
            }

        }

    });

    return ButtonsView;

});
