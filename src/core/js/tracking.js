define([
    'core/js/adapt',
    'core/js/enums/completionStateEnum'
], function(Adapt, COMPLETION_STATE) {

    var Tracking = Backbone.Controller.extend({

        _config: {
            _requireContentCompleted: true,
            _requireAssessmentPassed: false
        },

        _assessmentState: null,

        initialize: function() {
            Adapt.once('configModel:loadCourseData', this.loadConfig.bind(this));
            Adapt.on('app:dataReady', this.setupEventListeners.bind(this));
        },

        setupEventListeners: function() {
            // Check if completion requires passing an assessment. 
            if (this._config._requireAssessmentPassed) {
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
            if (this._config._requireAssessmentPassed && !this._assessmentState.isComplete) {
                return;
            }

            if (this._config._requireContentCompleted && !Adapt.course.get('_isComplete')) {
                return;
            }

            var completionData = {
                status: null,
                assessment: null
            };

            if (this._config._requireAssessmentPassed) {
                completionData.status = this._assessmentState.isPass ? COMPLETION_STATE.PASS : COMPLETION_STATE.FAIL;
                completionData.assessment = this._assessmentState
            } else {
                completionData.status = COMPLETION_STATE.COMPLETE;
            }

            Adapt.trigger('tracking:complete', completionData);
            Adapt.log.debug('tracking:complete', completionData);
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
