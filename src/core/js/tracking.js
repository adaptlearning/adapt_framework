define([
    'core/js/adapt',
    'core/js/enums/completionStateEnum'
], function(Adapt, COMPLETION_STATE) {

    var Tracking = Backbone.Controller.extend({

        _config: {
            _requireContentCompleted: true,
            _requireAssessmentPassed: false
        },

        _completionCriteria: [],

        initialize: function() {
            Adapt.once('configModel:loadCourseData', this.loadConfig.bind(this));
            Adapt.on('app:dataReady', this.setupEventListeners.bind(this));
        },

        setupEventListeners: function() {
            var self = this;

            // Check if completion requires passing an assessment. 
            if (this._config._requireAssessmentPassed) {
                // Add the assessment to the completion criteria.
                this._completionCriteria.push({ type: 'assessment', isComplete: false, isPass: null });

                // Listen for the 'assessment:complete' event.
                this.listenTo(Adapt, 'assessment:complete', function(assessment) {
                    if (assessment.attemptsLeft === 0 || assessment.isPass === true) {
                        self.markCompletionCriteria('assessment', assessment.isPass, assessment);
                    }
                });
            }

            // Check if completion requires completing all content.
            if (this._config._requireContentCompleted) {
                // Add this to the completion criteria.
                this._completionCriteria.push({ type: 'content', isComplete: false });

                this.listenTo(Adapt.components, 'change:_isComplete', function (model, isComplete) {

                    if (isComplete && Adapt.components.filter({ _isComplete: false, _isOptional: false }).length === 0) {
                        Adapt.log.debug('All components complete!');

                        self.markCompletionCriteria('content');
                    }
                });
            }
        },

        /**
         * Indicates that the criteria of a given type has been completed.
         * @param type {string} - Identifier of the criteria type, one of 'assessment' or 'content'.
         * @param isPass {Boolean} - Optional flag to indicate if the criteria was passed.
         * @param data {object} - Optional data object associated with the criteria, e.g. assessment state.
         */
        markCompletionCriteria: function(type, isPass, data) {
            if (!_.contains(['assessment', 'content'], type)) {
                Adapt.log.warn('Unrecognised "type" parameter passed to markCompletionCriteria() function');
                return;
            }

            this._completionCriteria = _.map(this._completionCriteria, function (criteria) {
                if (criteria.type === type) {
                    // Mark this criteria as complete.
                    criteria.isComplete = true;

                    if (typeof isPass === 'boolean') {
                        criteria.isPass = isPass;
                    }

                    if (data) {
                        // Append any other data.
                        criteria.data = data;
                    }
                }

                return criteria;
            });

            // Check if all specified items have been completed.
            if (_.where(this._completionCriteria, { isComplete: true }).length === this._completionCriteria.length) {
                // Signal that completion criteria has been achieved.
                var completionData = {
                    status: null,
                    assessment: null
                };
                var assessmentCriteria;

                // Calculate the status to return.
                if (this._config._requireAssessmentPassed) {
                    // The assessment was part of the completion criteria.
                    assessmentCriteria = _.findWhere(this._completionCriteria, { type: 'assessment' })

                    if (assessmentCriteria) {
                        completionData.status = (assessmentCriteria.isPass === true) ? COMPLETION_STATE.PASS : COMPLETION_STATE.FAIL;
                        completionData.assessment = assessmentCriteria.data || null;
                    }
                } else {
                    completionData.status = COMPLETION_STATE.COMPLETE;
                }

                Adapt.trigger('tracking:complete', completionData);
                Adapt.log.debug('tracking:complete', completionData);
            }
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
