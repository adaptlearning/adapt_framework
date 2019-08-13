define([
    'core/js/adapt'
], function(Adapt) {

    /**
     * Controller for managing accessibilty logging, specifically used for
     * controlling the display of removed or deprecated API warnings.
     */
    var Log = Backbone.Controller.extend({

        _warned: {},

        _hasWarned: function(args) {
            var config = Adapt.a11y.config;
            if (!config._options._warnFirstOnly) {
                return false;
            }
            var hash = _.map(args, String).join(':');
            if (this._warned[hash]) {
                return true;
            }
            this._warned[hash] = true;
            return false;
        },

        _canWarn: function() {
            var config = Adapt.a11y.config;
            return Boolean(config._options._warn);
        },

        removed: function() {
            if (!this._canWarn) {
                return;
            }
            var args = Array.prototype.slice.call(arguments);
            if (this._hasWarned(args)) {
                return;
            }
            Adapt.log.warn.apply(Adapt.log, ['A11Y REMOVED:'].concat(args));
            return this;
        },

        deprecated: function() {
            if (!this._canWarn) {
                return;
            }
            var args = Array.prototype.slice.call(arguments);
            if (this._hasWarned(args)) {
                return;
            }
            Adapt.log.warn.apply(Adapt.log, ['A11Y DEPRECATED:'].concat(args));
            return this;
        }

    });

    return Log;

});
