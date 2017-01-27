define(['core/js/adapt'], function(Adapt) {
  var Logging = Backbone.Model.extend({
    _config: {
      _isEnabled: true,
      _level: 'info',
      _console: true,
    },
    _override: false,
    _levels: {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
      fatal: 4
    },
    initialize: function() {
      // Override default log level with level present in query string
      var matches = window.location.search.match(/[?&]loglevel=([a-z]*)/i);
      if (matches && matches.length >= 2 && this._levels[matches[1]] >= 0) {
        this._config._level = matches[1];
        this._override = this._config._level;
        this.debug('Loglevel override in query string:', this._config._level);
      }

      Adapt.once('configModel:loadCourseData', this.onLoadCourseData.bind(this));
    },
    onLoadCourseData: function() {
      if (Adapt.config.has('_logging')) {
        this._config = Adapt.config.get('_logging');
      }

      // Query string log level wins over the config
      if (this._override) {
        this._config._level = this._override;
      }

      this.debug('Logging config loaded');
      this.trigger('log:ready');
    },
    debug: function(msg, data) {
      this._log('debug', msg, data);
    },
    info: function(msg, data) {
      this._log('info', msg, data);
    },
    warn: function(msg, data) {
      this._log('warn', msg, data);
    },
    error: function(msg, data) {
      this._log('error', msg, data);
    },
    fatal: function(msg, data) {
      this._log('fatal', msg, data);
    },
    _log: function(level, msg, data) {
      if (!this._config._isEnabled) {
        return;
      }

      if (this._levels[level] < this._levels[this._config._level]) {
        return;
      }

      if (this._config._console) {
        var log = [level.toUpperCase() + ':'];
        msg && log.push(msg);
        data && log.push(data);

        console.log.apply(console, log);
      }

      // Allow error reporting plugins to hook and report to logging systems
      this.trigger('log:' + level, msg, data);
    }
  });

  Adapt.log = new Logging();
});
