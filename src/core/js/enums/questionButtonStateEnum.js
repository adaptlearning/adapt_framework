define(function() {
	
	var QUESTION_BUTTON_STATE = ENUM([
        'submit',
        'correct',
        'showCorrectAnswer',
        'hideCorrectAnswer',
        'showFeedback',
        'reset'
    ]);

    return QUESTION_BUTTON_STATE;

})