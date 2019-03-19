define([
  'core/js/adapt',
  'core/js/enums/completionStateEnum'
], function(Adapt, COMPLETION_STATE) {

  var Tracking = Backbone.Controller.extend({

    _config: {
      _requireContentCompleted: true,
      _requireAssessmentCompleted: false
    },

    _assessmentState: null,

    initialize: function() {
      Adapt.once('configModel:dataLoaded', this.loadConfig.bind(this));
      Adapt.on('app:dataReady', this.setupEventListeners.bind(this));
    },

    setupEventListeners: function() {
      // Check if completion requires passing an assessment.
      if (this._config._requireAssessmentCompleted) {
        this.listenTo(Adapt, 'assessment:complete', this.onAssessmentComplete);
      }

      // Check if completion requires completing all content.
      if (this._config._requireContentCompleted) {
        this.listenTo(Adapt.course, 'change:_isComplete', this.checkCompletion);
      }
    },

    /**
     * Store the assessment state.
     * @param {object} assessmentState - The object returned by Adapt.assessment.getState()
     */
    onAssessmentComplete: function(assessmentState) {
      this._assessmentState = assessmentState;

      this.checkCompletion();
    },

    /**
     * Evaluate the course and assessment completion.
     */
    checkCompletion: function() {
      var completionData = this.getCompletionData();

      if (completionData.status === COMPLETION_STATE.INCOMPLETE) {
        return;
      }

      Adapt.trigger('tracking:complete', completionData);
      Adapt.log.debug('tracking:complete', completionData);
    },

    /**
     * The return value of this function should be passed to the trigger of 'tracking:complete'.
     * @returns An object representing the user's course completion.
     */
    getCompletionData: function() {
      var completionData = {
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
    },

    /**
     * Set the _config object to the values retrieved from config.json.
     */
    loadConfig: function() {
      if (Adapt.config.has('_completionCriteria')) {
        this._config = Adapt.config.get('_completionCriteria');
      }
    }

  });

  Adapt.tracking = new Tracking();

  return Adapt.tracking;

});
