import Adapt from 'core/js/adapt';
import QuestionModel from 'core/js/models/questionModel';
import ItemsComponentModel from 'core/js/models/itemsComponentModel';

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

export default class ItemsQuestionModel extends BlendedItemsComponentQuestionModel {

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
    const allChildren = this.getChildren();
    const activeChildren = allChildren.filter(itemModel => itemModel.get('_isActive'));

    const isItemCorrect = itemModel => itemModel.get('_shouldBeSelected') && !itemModel.get('_isPartlyCorrect');
    const isItemPartlyCorrect = itemModel => itemModel.get('_isPartlyCorrect');
    const isItemIncorrect = itemModel => !itemModel.get('_shouldBeSelected') && !itemModel.get('_isPartlyCorrect');

    const sum = (list, predicate) => list.reduce((sum, item) => sum + (predicate(item) ? 1 : 0), 0);

    const props = {
      _numberOfRequiredAnswers: sum(allChildren, isItemCorrect),
      _numberOfCorrectAnswers: sum(activeChildren, isItemCorrect),
      _numberOfPartlyCorrectAnswers: sum(activeChildren, isItemPartlyCorrect),
      _numberOfIncorrectAnswers: sum(activeChildren, isItemIncorrect)
    };

    activeChildren.forEach(itemModel => itemModel.set('_isCorrect', itemModel.get('_shouldBeSelected')));

    props._isAtLeastOneCorrectSelection = (props._numberOfCorrectAnswers || props._numberOfPartlyCorrectAnswers);

    const numberOfSelectableAnswers = this.get('_selectable');
    const hasSelectableCorrectAnswers = (props._numberOfCorrectAnswers === numberOfSelectableAnswers);
    const hasAllCorrectAnswers = (props._numberOfCorrectAnswers === props._numberOfRequiredAnswers);
    const hasCorrectAnswers = (hasSelectableCorrectAnswers || hasAllCorrectAnswers);
    const hasIncorrectAnswers = props._numberOfIncorrectAnswers;
    const hasPartlyCorrectAnswers = props._numberOfPartlyCorrectAnswers;

    this.set(props);

    return hasCorrectAnswers && !hasIncorrectAnswers && !hasPartlyCorrectAnswers;
  }

  // Sets the score based upon the questionWeight
  // Can be overwritten if the question needs to set the score in a different way
  setScore() {
    const questionWeight = this.get('_questionWeight');
    const answeredCorrectly = this.get('_isCorrect');
    const score = answeredCorrectly ? questionWeight : 0;
    this.set('_score', score);
  }

  get score() {
    if (!this.get('_hasItemScoring')) return super.score;
    const children = this.getChildren()?.toArray() || [];
    return children.reduce((score, child) => (score += child.get('_isActive') ? child.get('_score') || 0 : 0), 0);
  }

  get maxScore() {
    if (!this.get('_hasItemScoring')) return super.maxScore;
    const children = this.getChildren()?.toArray() || [];
    const scores = children.map(child => child.get('_score') || 0);
    scores.sort();
    return scores.reverse().slice(0, this.get('_selectable')).filter(score => score > 0).reduce((maxScore, score) => (maxScore += score), 0);
  }

  get minScore() {
    if (!this.get('_hasItemScoring')) return super.minScore;
    const children = this.getChildren()?.toArray() || [];
    const scores = children.map(child => child.get('_score') || 0);
    scores.sort();
    return scores.slice(0, this.get('_selectable')).filter(score => score < 0).reduce((minScore, score) => (minScore += score), 0);
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

  /**
   * Creates a string explaining the answer(s) the learner should have chosen
   * Used by ButtonsView to retrieve question-specific correct answer text for the ARIA
   * 'live region' that gets updated when the learner selects the 'show correct answer' button
   * @return {string}
   */
  getCorrectAnswerAsText() {
    const globals = Adapt.course.get('_globals')._components['_' + this.get('_component')];
    const isSingleSelect = this.isSingleSelect();
    const ariaAnswer = isSingleSelect ? globals?.ariaCorrectAnswer : globals?.ariaCorrectAnswers;
    if (!ariaAnswer) return;

    const correctOptions = this.getChildren().where({ _shouldBeSelected: true });
    const correctAnswer = isSingleSelect ?
      correctOptions[0]?.get('text') :
      correctOptions.map(correctOption => correctOption.get('text')).join('<br>');

    return Handlebars.compile(ariaAnswer)({ correctAnswer });
  }

  /**
   * Creates a string listing the answer(s) the learner chose
   * Used by ButtonsView to retrieve question-specific user answer text for the ARIA
   * 'live region' that gets updated when the learner selects the 'hide correct answer' button
   * @return {string}
   */
  getUserAnswerAsText() {
    const globals = Adapt.course.get('_globals')._components['_' + this.get('_component')];
    const isSingleSelect = this.isSingleSelect();
    const ariaAnswer = isSingleSelect ? globals?.ariaUserAnswer : globals?.ariaUserAnswers;
    if (!ariaAnswer) return;

    const selectedItems = this.getActiveItems();
    const userAnswer = isSingleSelect ?
      selectedItems[0].get('text') :
      selectedItems.map(selectedItem => selectedItem.get('text')).join('<br>');

    return Handlebars.compile(ariaAnswer)({ userAnswer });
  }

}
