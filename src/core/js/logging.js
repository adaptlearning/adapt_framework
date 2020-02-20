define([
  'core/js/adapt',
  'core/js/enums/logLevelEnum'
], function(Adapt, LOG_LEVEL) {

  var Logging = Backbone.Controller.extend({

    _config: {
      _isEnabled: true,
      _level: LOG_LEVEL.INFO.asLowerCase, // Default log level
      _console: true // Log to console
    },

    initialize: function() {

      Adapt.once('configModel:dataLoaded', this.onLoadConfigData.bind(this));

    },

    onLoadConfigData: function() {

      this.loadConfig();

      this.debug('Logging config loaded');

      this.trigger('log:ready');

    },

    loadConfig: function() {

      if (Adapt.config.has('_logging')) {
        this._config = Adapt.config.get('_logging');
      }

      this.checkQueryStringOverride();

    },

    checkQueryStringOverride: function() {

      // Override default log level with level present in query string
      var matches = window.location.search.match(/[?&]loglevel=([a-z]*)/i);
      if (!matches || matches.length < 2) return;

      var override = LOG_LEVEL(matches[1].toUpperCase());
      if (!override) return;

      this._config._level = override.asLowerCase;
      this.debug('Loglevel override in query string:', this._config._level);

    },

    debug: function() {
      this._log(LOG_LEVEL.DEBUG, Array.prototype.slice.call(arguments));
    },

    info: function() {
      this._log(LOG_LEVEL.INFO, Array.prototype.slice.call(arguments));
    },

    warn: function() {
      this._log(LOG_LEVEL.WARN, Array.prototype.slice.call(arguments));
    },

    error: function() {
      this._log(LOG_LEVEL.ERROR, Array.prototype.slice.call(arguments));
    },

    fatal: function() {
      this._log(LOG_LEVEL.FATAL, Array.prototype.slice.call(arguments));
    },

    _log: function(level, data) {

      var isEnabled = (this._config._isEnabled);
      if (!isEnabled) return;

      var configLevel = LOG_LEVEL(this._config._level.toUpperCase());

      var isLogLevelAllowed = (level >= configLevel);
      if (!isLogLevelAllowed) return;

      this._logToConsole(level, data);

      // Allow error reporting plugins to hook and report to logging systems
      this.trigger('log', level, data);
      this.trigger('log:' + level.asLowerCase, level, data);

    },

    _logToConsole: function(level, data) {

      var shouldLogToConsole = (this._config._console);
      if (!shouldLogToConsole) return;

      var log = [level.asUpperCase + ':'];
      data && log.push.apply(log, data);

      // is there a matching console method we can use e.g. console.error()?
      if (console[level.asLowerCase]) {
        console[level.asLowerCase].apply(console, log);
      } else {
        console.log.apply(console, log);
      }
    }

  });

  Adapt.log = new Logging();

});
