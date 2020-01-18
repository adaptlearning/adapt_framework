define([
    'core/js/adapt',
    './a11y'
], function(Adapt, a11y) {

    /**
     * Backwards compatibility `Adapt.accessibility` reroutes to `Adapt.a11y`
     * with a warning.
     */
    Object.defineProperty(Adapt, 'accessibility', {

        get: function() {
            a11y.log.deprecated("Adapt.accessibility has moved to Adapt.a11y");
            return Adapt.accessibility = a11y;
        }

    });

});
