define(function() {

    var BUTTON_STATE = ENUM([
        'submit',
        'correct',
        'showCorrectAnswer',
        'hideCorrectAnswer',
        'showFeedback',
        'reset'
    ]);

    return BUTTON_STATE;

})