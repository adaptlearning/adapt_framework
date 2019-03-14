define([
  'core/js/adapt',
  'core/js/models/questionModel',
  'core/js/models/itemsComponentModel'
], function(Adapt, QuestionModel, ItemsComponentModel) {

  var BlendedModel = QuestionModel.extend(ItemsComponentModel.prototype);
  var ItemsQuestionModel = BlendedModel.extend({

    init: function() {
      QuestionModel.prototype.init.call(this);
      ItemsComponentModel.prototype.init.call(this);

      this.set('_isRadio', this.isSingleSelect());
    },

    restoreUserAnswers: function() {
      if (!this.get('_isSubmitted')) return;

      var itemModels = this.getChildren();
      var userAnswer = this.get('_userAnswer');
      itemModels.each(function(item, index) {
        item.toggleActive(userAnswer[item._index]);
      });

      this.setQuestionAsSubmitted();
      this.markQuestion();
      this.setScore();
      this.setupFeedback();
    },

    setupRandomisation: function() {
      if (!this.get('_isRandom') || !this.get('_isEnabled')) return;
      var children = this.getChildren();
      children.set(children.shuffle());
    },

    // check if the user is allowed to submit the question
    canSubmit: function() {
      var activeItems = this.getActiveItems();
      return activeItems.length > 0;
    },

    // This is important for returning or showing the users answer
    // This should preserve the state of the users answers
    storeUserAnswer: function() {
      var items = this.getChildren().slice(0);
      items.sort(function(a, b) {
        return a.get('_index') - b.get('_index');
      });

      var userAnswer = items.map(function(itemModel) {
        return itemModel.get('_isActive');
      });
      this.set('_userAnswer', userAnswer);
    },

    isCorrect: function() {

      var props = {
        _numberOfRequiredAnswers: 0,
        _numberOfIncorrectAnswers: 0,
        _isAtLeastOneCorrectSelection: false,
        _numberOfCorrectAnswers: 0,
      };

      this.getChildren().each(function(itemModel) {
        var itemShouldBeActive = itemModel.get('_shouldBeSelected');
        if (itemShouldBeActive) {
          props._numberOfRequiredAnswers++;
        }

        if (!itemModel.get('_isActive')) return;

        if (!itemShouldBeActive) {
          props._numberOfIncorrectAnswers++;
          return;
        }

        props._isAtLeastOneCorrectSelection = true;
        props._numberOfCorrectAnswers++;
        itemModel.set('_isCorrect', true);
      });

      this.set(props);

      var hasRightNumberOfCorrectAnswers = (props._numberOfCorrectAnswers === props._numberOfRequiredAnswers);
      var hasNoIncorrectAnswers = !props._numberOfIncorrectAnswers;

      return hasRightNumberOfCorrectAnswers && hasNoIncorrectAnswers;
    },

    // Sets the score based upon the questionWeight
    // Can be overwritten if the question needs to set the score in a different way
    setScore: function() {
      var questionWeight = this.get('_questionWeight');
      var answeredCorrectly = this.get('_isCorrect');
      var score = answeredCorrectly ? questionWeight : 0;
      this.set('_score', score);
    },

    setupFeedback: function() {
      if (!this.has('_feedback')) return;

      if (this.get('_isCorrect')) {
        this.setupCorrectFeedback();
        return;
      }

      if (this.isPartlyCorrect()) {
        this.setupPartlyCorrectFeedback();
        return;
      }

      // apply individual item feedback
      var activeItem = this.getActiveItem();
      if (this.isSingleSelect() && activeItem.get('feedback')) {
        this.setupIndividualFeedback(activeItem);
        return;
      }

      this.setupIncorrectFeedback();
    },

    setupIndividualFeedback: function(selectedItem) {
      this.set({
        feedbackTitle: this.getFeedbackTitle(this.get('_feedback')),
        feedbackMessage: selectedItem.get("feedback")
      });
    },

    isPartlyCorrect: function() {
      return this.get('_isAtLeastOneCorrectSelection');
    },

    resetUserAnswer: function() {
      this.set('_userAnswer', []);
    },

    isAtActiveLimit: function() {
      var selectedItems = this.getActiveItems();
      return (selectedItems.length === this.get('_selectable'));
    },

    isSingleSelect: function() {
      return (this.get('_selectable') === 1);
    },

    getLastActiveItem: function(){
      var selectedItems = this.getActiveItems();
      return selectedItems[selectedItems.length-1];
    },

    resetItems: function() {
      this.resetActiveItems();
      this.set('_isAtLeastOneCorrectSelection', false);
    },

    getInteractionObject: function() {
      var interactions = {
        correctResponsesPattern: [],
        choices: []
      };

      interactions.choices = this.getChildren().map(function(itemModel) {
        return {
          id: (itemModel.get('_index') + 1).toString(),
          description: itemModel.get('text')
        };
      });

      var correctItems = this.getChildren().filter(function(itemModel) {
        return itemModel.get('_shouldBeSelected');
      });

      interactions.correctResponsesPattern = [
        correctItems.map(function(itemModel) {
          // indexes are 0-based, we need them to be 1-based for cmi.interactions
          return String(itemModel.get('_index') + 1);
        })
        .join('[,]')
      ];

      return interactions;
    },

    /**
    * used by adapt-contrib-spoor to get the user's answers in the format required by the cmi.interactions.n.student_response data field
    * returns the user's answers as a string in the format '1,5,2'
    */
    getResponse: function() {
      var activeItems = this.getActiveItems();
      var activeIndexes = activeItems.map(function(itemModel) {
        // indexes are 0-based, we need them to be 1-based for cmi.interactions
        return itemModel.get('_index') + 1;
      });
      return activeIndexes.join(',');
    },

    /**
    * used by adapt-contrib-spoor to get the type of this question in the format required by the cmi.interactions.n.type data field
    */
    getResponseType: function() {
      return 'choice';
    }

  });

  return ItemsQuestionModel;

});
