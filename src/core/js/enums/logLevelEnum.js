define(function() {

  // Used to determine if log call should be printed based on log level
  var LOG_LEVEL = ENUM([
    'DEBUG',
    'INFO',
    'WARN',
    'ERROR',
    'FATAL'
  ]);

  return LOG_LEVEL;

});
