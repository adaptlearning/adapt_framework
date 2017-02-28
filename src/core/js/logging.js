define([
    'core/js/adapt',
    'core/js/enums/loggingLevelEnum'
], function(Adapt, LOGGING_LEVEL) {

    // Used to determine if log call should be printed based on log level
    var Logging = Backbone.Model.extend({

        _config: {
            _isEnabled: true,
            _level: LOGGING_LEVEL.INFO.asString, // Default log level
            _console: true, // Log to console
        },      
        
        initialize: function() {

            Adapt.once('configModel:loadCourseData', this.onLoadCourseData.bind(this));

        },
        
        onLoadCourseData: function() {

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

            var override = LOGGING_LEVEL(matches[1].toUpperCase());
            if (!override) return;

            this._config._level = override.asString;
            this.debug('Loglevel override in query string:', this._config._level);
            
        },
        
        debug: function() {            
            this._log(LOGGING_LEVEL.DEBUG, Array.prototype.slice.call(arguments));
        },
        
        info: function() {
            this._log(LOGGING_LEVEL.INFO, Array.prototype.slice.call(arguments));
        },
        
        warn: function() {
            this._log(LOGGING_LEVEL.WARN, Array.prototype.slice.call(arguments));
        },
        
        error: function() {
            this._log(LOGGING_LEVEL.ERROR, Array.prototype.slice.call(arguments));
        },
        
        fatal: function() {
            this._log(LOGGING_LEVEL.FATAL, Array.prototype.slice.call(arguments));
        },
        
        _log: function(level, data) {

            var isEnabled = (this._config._isEnabled);
            if (!isEnabled) return;

            var isLogLevelAllowed = (level >= LOGGING_LEVEL(this._config._level.toUpperCase()));
            if (!isLogLevelAllowed) return;

            var shouldLogToConsole = (this._config._console);
            if (shouldLogToConsole) {

                var log = [level.asString + ':'];
                data && log.push.apply(log, data);

                console.log.apply(console, log);

            }

            // Allow error reporting plugins to hook and report to logging systems
            this.trigger('log', level, data);
            this.trigger('log:' + level.asString.toLowerCase(), level, data);

        }

    });

    Adapt.log = new Logging();
});
