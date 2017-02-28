define(function() {

    // Used to determine if log call should be printed based on log level
    var LOGGING_LEVEL = ENUM([
        "debug",
        "info",
        "warn",
        "error",
        "fatal"
    ]);

    return LOGGING_LEVEL;

})