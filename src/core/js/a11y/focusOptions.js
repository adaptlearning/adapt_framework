define(function() {

    /**
     * Options parser for focus functions.
     * @class
     */
    var FocusOptions = function(options) {
        _.defaults(this, options, {

            /**
             * Stops the browser from scrolling to the focused point.
             * https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus
             *
             * @type {boolean}
             */
            preventScroll: true,

            /**
             * Add a defer to the focus call, allowing for user interface settling.
             *
             * @type {boolean}
             */
            defer: false

        });
    };

    return FocusOptions;

});