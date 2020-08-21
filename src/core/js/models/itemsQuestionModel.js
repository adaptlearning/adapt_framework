define([
  'core/js/adapt',
  'core/js/models/questionModel',
  'core/js/models/itemsComponentModel'
], function(Adapt, QuestionModel, ItemsComponentModel) {

  class BlendedItemsComponentQuestionModel extends QuestionModel {

    init() {
      ItemsComponentModel.prototype.init.call(this);
      super.init();
    }

    reset(type, force) {
      ItemsComponentModel.prototype.reset.call(this, type, force);
      super.reset(type, force);
    }

  }
  // extend BlendedItemsComponentQuestionModel with ItemsComponentModel
  Object.getOwnPropertyNames(ItemsComponentModel.prototype).forEach(name => {
    if (name === 'constructor' || name === 'init' || name === 'reset') return;
    Object.defineProperty(BlendedItemsComponentQuestionModel.prototype, name, {
      value: ItemsComponentModel.prototype[name]
    });
  });

  class ItemsQuestionModel extends BlendedItemsComponentQuestionModel {

    init() {
      super.init();
      this.set('_isRadio', this.isSingleSelect());
      this.listenTo(this.getChildren(), 'change:_isActive', this.checkCanSubmit);
      this.checkCanSubmit();
    }

    restoreUserAnswers() {
      if (!this.get('_isSubmitted')) return;

      const itemModels = this.getChildren();
      const userAnswer = this.get('_userAnswer');
      itemModels.each(item => {
        item.toggleActive(userAnswer[item.get('_index')]);
      });

      this.setQuestionAsSubmitted();
      this.markQuestion();
      this.setScore();
      this.setupFeedback();
    }

    setupRandomisation() {
      if (!this.get('_isRandom') || !this.get('_isEnabled')) return;
      const children = this.getChildren();
      children.set(children.shuffle());
    }

    // check if the user is allowed to submit the question
    canSubmit() {
      const activeItems = this.getActiveItems();
      return activeItems.length > 0;
    }

    // This is important for returning or showing the users answer
    // This should preserve the state of the users answers
    storeUserAnswer() {
      const items = this.getChildren().slice(0);
      items.sort((a, b) => a.get('_index') - b.get('_index'));
      const userAnswer = items.map(itemModel => itemModel.get('_isActive'));
      this.set('_userAnswer', userAnswer);
    }

    isCorrect() {

      const props = {
        _numberOfRequiredAnswers: 0,
        _numberOfIncorrectAnswers: 0,
        _isAtLeastOneCorrectSelection: false,
        _numberOfCorrectAnswers: 0
      };

      this.getChildren().each(itemModel => {
        const itemShouldBeActive = itemModel.get('_shouldBeSelected');
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

      const hasRightNumberOfCorrectAnswers = (props._numberOfCorrectAnswers === props._numberOfRequiredAnswers);
      const hasNoIncorrectAnswers = !props._numberOfIncorrectAnswers;

      return hasRightNumberOfCorrectAnswers && hasNoIncorrectAnswers;
    }

    // Sets the score based upon the questionWeight
    // Can be overwritten if the question needs to set the score in a different way
    setScore() {
      const questionWeight = this.get('_questionWeight');
      const answeredCorrectly = this.get('_isCorrect');
      const score = answeredCorrectly ? questionWeight : 0;
      this.set('_score', score);
    }

    setupFeedback() {
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
      const activeItem = this.getActiveItem();
      if (this.isSingleSelect() && activeItem.get('feedback')) {
        this.setupIndividualFeedback(activeItem);
        return;
      }

      this.setupIncorrectFeedback();
    }

    setupIndividualFeedback(selectedItem) {
      this.set({
        feedbackTitle: this.getFeedbackTitle(this.get('_feedback')),
        feedbackMessage: selectedItem.get('feedback')
      });
    }

    isPartlyCorrect() {
      return this.get('_isAtLeastOneCorrectSelection');
    }

    resetUserAnswer() {
      this.set('_userAnswer', []);
    }

    isAtActiveLimit() {
      const selectedItems = this.getActiveItems();
      return (selectedItems.length === this.get('_selectable'));
    }

    isSingleSelect() {
      return (this.get('_selectable') === 1);
    }

    getLastActiveItem() {
      const selectedItems = this.getActiveItems();
      return selectedItems[selectedItems.length - 1];
    }

    resetItems() {
      this.resetActiveItems();
      this.set('_isAtLeastOneCorrectSelection', false);
    }

    getInteractionObject() {
      const interactions = {
        correctResponsesPattern: [],
        choices: []
      };

      interactions.choices = this.getChildren().map(itemModel => {
        return {
          id: (itemModel.get('_index') + 1).toString(),
          description: itemModel.get('text')
        };
      });

      const correctItems = this.getChildren().filter(itemModel => {
        return itemModel.get('_shouldBeSelected');
      });

      interactions.correctResponsesPattern = [
        correctItems.map(itemModel => {
          // indexes are 0-based, we need them to be 1-based for cmi.interactions
          return String(itemModel.get('_index') + 1);
        }).join('[,]')
      ];

      return interactions;
    }

    /**
    * used by adapt-contrib-spoor to get the user's answers in the format required by the cmi.interactions.n.student_response data field
    * returns the user's answers as a string in the format '1,5,2'
    */
    getResponse() {
      const activeItems = this.getActiveItems();
      const activeIndexes = activeItems.map(itemModel => {
        // indexes are 0-based, we need them to be 1-based for cmi.interactions
        return itemModel.get('_index') + 1;
      });
      return activeIndexes.join(',');
    }

    /**
    * used by adapt-contrib-spoor to get the type of this question in the format required by the cmi.interactions.n.type data field
    */
    getResponseType() {
      return 'choice';
    }

  }

  return ItemsQuestionModel;

});
