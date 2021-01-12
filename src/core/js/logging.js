import Adapt from 'core/js/adapt';
import LOG_LEVEL from 'core/js/enums/logLevelEnum';

class Logging extends Backbone.Controller {

  initialize() {
    this._config = {
      _isEnabled: true,
      _level: LOG_LEVEL.INFO.asLowerCase, // Default log level
      _console: true, // Log to console
      _warnFirstOnly: true // Show only first of identical removed and deprecated warnings
    };
    this._warned = {};
    this.listenToOnce(Adapt, 'configModel:dataLoaded', this.onLoadConfigData);
  }

  onLoadConfigData() {

    this.loadConfig();

    this.debug('Logging config loaded');

    this.trigger('log:ready');

  }

  loadConfig() {

    if (Adapt.config.has('_logging')) {
      this._config = Adapt.config.get('_logging');
    }

    this.checkQueryStringOverride();

  }

  checkQueryStringOverride() {

    // Override default log level with level present in query string
    const matches = window.location.search.match(/[?&]loglevel=([a-z]*)/i);
    if (!matches || matches.length < 2) return;

    const override = LOG_LEVEL(matches[1].toUpperCase());
    if (!override) return;

    this._config._level = override.asLowerCase;
    this.debug('Loglevel override in query string:', this._config._level);

  }

  debug(...args) {
    this._log(LOG_LEVEL.DEBUG, args);
  }

  info(...args) {
    this._log(LOG_LEVEL.INFO, args);
  }

  warn(...args) {
    this._log(LOG_LEVEL.WARN, args);
  }

  error(...args) {
    this._log(LOG_LEVEL.ERROR, args);
  }

  fatal(...args) {
    this._log(LOG_LEVEL.FATAL, args);
  }

  removed(...args) {
    args = ['REMOVED'].concat(args);
    this.warnOnce(...args);
  }

  deprecated(...args) {
    args = ['DEPRECATED'].concat(args);
    this.warnOnce(...args);
  }

  warnOnce(...args) {
    if (this._hasWarned(args)) {
      return;
    }
    this._log(LOG_LEVEL.WARN, args);
  }

  _log(level, data) {

    const isEnabled = (this._config._isEnabled);
    if (!isEnabled) return;

    const configLevel = LOG_LEVEL(this._config._level.toUpperCase());

    const isLogLevelAllowed = (level >= configLevel);
    if (!isLogLevelAllowed) return;

    this._logToConsole(level, data);

    // Allow error reporting plugins to hook and report to logging systems
    this.trigger('log', level, data);
    this.trigger('log:' + level.asLowerCase, level, data);

  }

  _logToConsole(level, data) {

    const shouldLogToConsole = (this._config._console);
    if (!shouldLogToConsole) return;

    const log = [level.asUpperCase + ':'];
    data && log.push(...data);

    // is there a matching console method we can use e.g. console.error()?
    if (console[level.asLowerCase]) {
      console[level.asLowerCase](...log);
    } else {
      console.log(...log);
    }
  }

  _hasWarned(args) {
    if (!this._config._warnFirstOnly) {
      return false;
    }
    const hash = args.map(String).join(':');
    if (this._warned[hash]) {
      return true;
    }
    this._warned[hash] = true;
    return false;
  }

}

export default (Adapt.log = new Logging());
