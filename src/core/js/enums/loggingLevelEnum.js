define(function() {

    // Used to determine if log call should be printed based on log level
    var LOGGING_LEVEL = ENUM([
        "DEBUG",
        "INFO",
        "WARN",
        "ERROR",
        "FATAL"
    ]);

    return LOGGING_LEVEL;

})