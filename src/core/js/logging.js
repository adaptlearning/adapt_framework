define(['core/js/adapt'], function(Adapt) {
    var Logging = Backbone.Model.extend({
        _config: {
            _isEnabled: true,
            _level: 'info', // Default log level
            _console: true, // Log to console
        },      

        // Used to determine if log call should be printed based on log level
        _levels: { 
            debug: 0,
            info: 1,
            warn: 2,
            error: 3,
            fatal: 4
        },

        // Tracks if query string overrode config
        _override: false, 
        
        initialize: function() {
            // Override default log level with level present in query string
            var matches = window.location.search.match(/[?&]loglevel=([a-z]*)/i);
            if (matches && matches.length >= 2) {
                var level = matches[1].toLowerCase();
                if (this._levels[level] >= 0) {
                    this._config._level = level;
                    this._override = this._config._level;
                    this.debug('Loglevel override in query string:', this._config._level);
                }
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
        
        debug: function() {            
            this._log('debug', Array.prototype.slice.call(arguments));
        },
        
        info: function() {
            this._log('info', Array.prototype.slice.call(arguments));
        },
        
        warn: function() {
            this._log('warn', Array.prototype.slice.call(arguments));
        },
        
        error: function() {
            this._log('error', Array.prototype.slice.call(arguments));
        },
        
        fatal: function() {
            this._log('fatal', Array.prototype.slice.call(arguments));
        },
        
        _log: function(level, data) {
            if (!this._config._isEnabled) {
                return;
            }

            if (this._levels[level] < this._levels[this._config._level]) {
                return;
            }

            if (this._config._console) {
                var log = [level.toUpperCase() + ':'];
                data && log.push.apply(log, data);

                console.log.apply(console, log);
            }

            // Allow error reporting plugins to hook and report to logging systems
            this.trigger('log:' + level, data);
        }
    });

    Adapt.log = new Logging();
});
