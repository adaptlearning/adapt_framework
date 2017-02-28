define(function() {
	
	var LOGGING_LEVEL = ENUM([
        "DEBUG",
        "INFO",
        "WARN",
        "ERROR",
        "FATAL"
    ]);

    return LOGGING_LEVEL;

})