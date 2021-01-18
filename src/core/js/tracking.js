import Adapt from 'core/js/adapt';
import COMPLETION_STATE from 'core/js/enums/completionStateEnum';

class Tracking extends Backbone.Controller {

  initialize() {
    this._config = {
      _requireContentCompleted: true,
      _requireAssessmentCompleted: false
    };
    this._assessmentState = null;

    Adapt.once('configModel:dataLoaded', this.loadConfig.bind(this));
    Adapt.on('app:dataReady', this.setupEventListeners.bind(this));
  }

  setupEventListeners() {
    // Check if completion requires passing an assessment.
    if (this._config._requireAssessmentCompleted) {
      this.listenTo(Adapt, {
        'assessment:complete': this.onAssessmentComplete,
        'assessment:restored': this.onAssessmentRestored
      });
    }

    // Check if completion requires completing all content.
    if (this._config._requireContentCompleted) {
      this.listenTo(Adapt.course, 'change:_isComplete', this.checkCompletion);
    }
  }

  /**
   * Store the assessment state.
   * @param {object} assessmentState - The object returned by Adapt.assessment.getState()
   */
  onAssessmentComplete(assessmentState) {
    this._assessmentState = assessmentState;

    this.checkCompletion();
  }

  /**
   * Restores the _assessmentState object when an assessment is registered.
   * @param {object} assessmentState - An object representing the overall assessment state
   */
  onAssessmentRestored(assessmentState) {
    this._assessmentState = assessmentState;
  }

  /**
   * Evaluate the course and assessment completion.
   */
  checkCompletion() {
    const completionData = this.getCompletionData();

    if (completionData.status === COMPLETION_STATE.INCOMPLETE) {
      return;
    }

    Adapt.trigger('tracking:complete', completionData);
    Adapt.log.debug('tracking:complete', completionData);
  }

  /**
   * The return value of this function should be passed to the trigger of 'tracking:complete'.
   * @returns An object representing the user's course completion.
   */
  getCompletionData() {
    const completionData = {
      status: COMPLETION_STATE.INCOMPLETE,
      assessment: null
    };

    // Course complete is required.
    if (this._config._requireContentCompleted && !Adapt.course.get('_isComplete')) {
      // INCOMPLETE: course not complete.
      return completionData;
    }

    // Assessment completed required.
    if (this._config._requireAssessmentCompleted) {
      if (!this._assessmentState) {
        // INCOMPLETE: assessment is not complete.
        return completionData;
      }

      // PASSED/FAILED: assessment completed.
      completionData.status = this._assessmentState.isPass ? COMPLETION_STATE.PASSED : COMPLETION_STATE.FAILED;
      completionData.assessment = this._assessmentState;

      return completionData;
    }

    // COMPLETED: criteria met, no assessment requirements.
    completionData.status = COMPLETION_STATE.COMPLETED;

    return completionData;
  }

  /**
   * Set the _config object to the values retrieved from config.json.
   */
  loadConfig() {
    if (Adapt.config.has('_completionCriteria')) {
      this._config = Adapt.config.get('_completionCriteria');
    }
  }

}

Adapt.tracking = new Tracking();

export default Adapt.tracking;
