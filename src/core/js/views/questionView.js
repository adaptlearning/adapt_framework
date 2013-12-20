/*
* QuestionView
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Daryl Hedley
*/

define(["handlebars", "coreViews/componentView", "coreJS/adapt"], function(Handlebars, ComponentView, Adapt) {

    var QuestionView = ComponentView.extend({
    
        className: function() {
            return "component question-component " + this.model.get('_component')+"-component " + this.model.get('_id'); },
        
        init: function() {
            this.constructor.template = this.model.get('_component');
            this.resetQuestion({resetAttempts:true, initialisingScreen:true});
            this.setupFeedbackArrays();
			this.listenTo(this.model, 'change:_isEnabled', this.onEnabledChanged);
        },
        
        isCorrect: function() {
            return !!Math.floor(this.model.get('_numberOfCorrectAnswers') / this.model.get('items').length);
        },
        
        isPartlyCorrect: function() {
            return !this.isCorrect() && this.model.get('_isAtLeastOneCorrectSelection');
        },
        
        getNumberOfCorrectAnswers: function() {
            var numberOfCorrectAnswers = 0;
            this.forEachAnswer(function(correct) {
                if(correct) numberOfCorrectAnswers++;
            });
            return numberOfCorrectAnswers;
        },
        
        getOptionSpecificFeedback: function() {
            return this.getSelectedItems().feedback;
        },
    
        getOptionSpecificAudio: function() {
            return this.getSelectedItems().audio;
        },
        
        getSelectedItems: function() {
            var selectedItems = this.model.get('_selectedItems');
            // if no second item exists, return just the first, else return the array
            return !selectedItems[1] ? selectedItems[0] : selectedItems;
        },
        
        markQuestion: function() {
			var correctCount = this.getNumberOfCorrectAnswers();
			var score = 0;
			
			if (this.model.has("_questionWeight"))
			{
				score = this.model.get("_questionWeight") * correctCount / this.model.get('items').length;
			}
			else
			{
				score = Adapt.course.get("_questionWeight") * correctCount / this.model.get('items').length;
			}
			
            this.model.set("_numberOfCorrectAnswers", correctCount);
			this.model.set("_score", score);
            this.isCorrect() ? this.onQuestionCorrect() : this.onQuestionIncorrect();
        },
        
        resetQuestion: function(properties) {
            var shouldEnable = true;
            if(!!properties.initialisingScreen && this.model.get("_isEnabledOnRevisit") !== undefined && !!this.model.get('_isComplete')) {
                /*if(Adapt.Spoor) {
                    var sameSession = this.model.get('_sessionID') === Adapt.Spoor.get('_sessionID');
                    if(sameSession) {
                        shouldEnable = this.model.get("_isEnabledOnRevisit");
                    }
                } else {*/
                    shouldEnable = this.model.get("_isEnabledOnRevisit");
                //}
            }
            
            this.model.set({"_isEnabled": shouldEnable});
            
            if(shouldEnable) {
                _.each(this.model.get('_selectedItems'), function(item) {item.selected = false}, this);
                this.model.set({
                    _isSubmitted: false,
                    _selectedItems: [],
                    _userAnswer: [],
                });
                if(properties.resetAttempts === true) this.model.set("_attemptsLeft", this.model.get('_attempts'));
                if(properties.resetCorrect === true) {
                    this.model.set({
                        _isCorrect: false,
                        _isAtLeastOneCorrectSelection: false
                    });
                }
            }
        },
        
        setupFeedbackArrays: function() {
            if(_.isString(this.model.get('feedback').partly)) {
                this.model.get('feedback').partly = [this.model.get('feedback').partly, this.model.get('feedback').partly] 
            }
            if(_.isString(this.model.get('feedback').incorrect)) {
                this.model.get('feedback').incorrect = [this.model.get('feedback').incorrect, this.model.get('feedback').incorrect]
            }
        },
    
        showFeedback: function() {
            
            if(this.model.get("_isAssessment")) {
                this.showAssessmentFeedback();
                return;
            }
            
            this.model.set('tutorAudio', this.model.get("feedback").audio)
            
            if(this.model.get('_isSelectable') === 1) {
                if(this.getOptionSpecificFeedback()) {
                    this.model.set('tutorMessage', this.getOptionSpecificFeedback());
                }
                if(this.getOptionSpecificAudio()) {
                    this.model.set('tutorAudio', this.getOptionSpecificAudio());
                }
            }

            Adapt.trigger('QuestionView:feedback', {feedback:this.model.get('tutorMessage')});
            alert("Feedback: " + this.model.get('tutorMessage'));
            
            /*new TutorModel({
                title: this.model.get('title'), 
                message: this.model.get('tutorMessage'),
                audio: this.model.get('tutorAudio')
            });*/
        },
        
        showAssessmentFeedback: function() {
            alert("Assessment feedback");
        },
        
        showMarking: function() {
            _.each(this.model.get('items'), function(item, i) {
                var $item = this.$('.item').eq(i);
                $item.addClass(item.correct ? 'correct' : 'incorrect');
            }, this);
        },
        
        showModelAnswer: function () {
            this.$(".component-widget").removeClass("user").addClass("model");
            this.onModelAnswerShown();
        },
        
        showUserAnswer: function() {
            this.$(".component-widget").removeClass("model").addClass("user");
            this.onUserAnswerShown();
        },
        
        onComplete: function(parameters) {
            this.model.set({
                _isComplete: true,
                _isEnabled: false,
                _isCorrect: !!parameters.correct
            });
            this.$(".component-widget").addClass("disabled");
            if(parameters.correct) this.$(".component-widget").addClass("correct");
            this.showMarking();
            this.showUserAnswer();
            /*if(Adapt.Spoor) {
                this.model.set('sessionID', Adapt.Spoor.get('sessionID'));
            }*/
        },
    
        onModelAnswerClicked: function(event) {
            if(event) event.preventDefault();
            this.showModelAnswer();
        },
        
        onQuestionCorrect: function() {
            this.onComplete({correct: true});
            this.model.getParent("article").attributes.score ++;
            this.model.set("tutorMessage", this.model.get("feedback").correct);
        },
        
        onQuestionIncorrect: function() {
            var feedbackIndex = Math.ceil(this.model.get("_attemptsLeft")/this.model.get("_attempts"));
            if(this.isPartlyCorrect()) { 
                this.model.set("tutorMessage", this.model.get("feedback").partly[feedbackIndex]);
            } else {
                this.model.set("tutorMessage", this.model.get("feedback").incorrect[feedbackIndex]);
            }
            if(feedbackIndex === 0) {
                this.onComplete({correct: false});
            }
        },
        
        onResetClicked: function(event) {
            if(event) event.preventDefault(); 
            this.resetQuestion({resetAttempts:false, resetCorrect:true});
            this.$(".component-widget").removeClass("submitted");
            this.resetItems();
        },
    
        onSubmitClicked: function(event) {
            
            event.preventDefault();
            
            if(!this.canSubmit()) return;
            
            Adapt.tabHistory = $(event.currentTarget).parent('.component-inner');
            
            var attemptsLeft = this.model.get("_attemptsLeft") - 1;
            this.model.set({
                _isEnabled: false,
                _isSubmitted: true,
                _attemptsLeft: attemptsLeft
            });
            this.$(".component-widget").addClass("submitted");
            
            this.storeUserAnswer();
            this.markQuestion();
            this.showFeedback();
        },
    
        onUserAnswerClicked: function(event) {
            if(event) event.preventDefault();
            this.showUserAnswer();
        },
		
		onEnabledChanged: function () {
        },
        
        postRender: function() {
            ComponentView.prototype.postRender.apply(this);
            if(this.model.get('_isEnabled') == false) {
                this.showUserAnswer();
            }
        },
        
        /**
        * to be implemented by subclass
        */
        // compulsory methods
        canSubmit: function() { 
            //throw new AbstractMethodError({invoker: this.constructor, methodName:"canSubmit"}) 
        },
        forEachAnswer: function() { 
            //throw new AbstractMethodError({invoker: this.constructor, methodName:"forEachAnswer"})
        },
        
        // optional methods
        resetItems: function(){ 
            //if(this.constructor.abstract) throw new AbstractMethodError({invoker: this.constructor, methodName:"resetItems"}) 
        },
        onModelAnswerShown: function() { 
            //if(this.constructor.abstract) throw new AbstractMethodError({invoker: this.constructor, methodName:"onModelAnswerShown"}) 
        },
        onUserAnswerShown: function() { 
            //if(this.constructor.abstract) throw new AbstractMethodError({invoker: this.constructor, methodName:"onUserAnswerShown"}) 
        },
        storeUserAnswer: function() { 
            //if(this.constructor.abstract) throw new AbstractMethodError({invoker: this.constructor, methodName:"storeUserAnswer"}) 
        }
        
    });
    
    return QuestionView;

});