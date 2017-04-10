define(function() {

    var BUTTON_STATE = ENUM([
        'SUBMIT',
        'CORRECT',
        'INCORRECT',
        'SHOW_CORRECT_ANSWER',
        'HIDE_CORRECT_ANSWER',
        'SHOW_FEEDBACK',
        'RESET'
    ]);

    return BUTTON_STATE;

})