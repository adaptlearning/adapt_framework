define(function() {

     var Wait = Backbone.Controller.extend({

        initialize: function() {
            _.bindAll(this, 'begin', 'end');
        },

        _waitCount: 0,
        _callbackHandle: null,
        _timeoutHandlerId: null,
        _timeoutInSeconds: 7,

        /**
         * Returns true if there are items in the waiting count.
         * 
         * @return {Boolean}
         */
        isWaiting: function() {
            return (this._waitCount !== 0);
        },

        /**
         * Starts or re-starts a timer to ensure that pending calls to end()
         * are actually executed after a timeout period.
         */
        startTimer: function() {
            this.stopTimer();

            this._timeoutHandlerId = setInterval(function() {
                // Flush Adapt.wait due to timeout
                while (this._waitCount > 0) {
                    // Trigger an end() for anything waiting.
                    this.end();
                }
  
                if (this._waitCount === 0) {
                    this.stopTimer();
                }
            }.bind(this), this._timeoutInSeconds * 1000)
        },

        /**
         * Clears the timer.
         */
        stopTimer: function() {
            if (this._timeoutHandlerId) {
                clearInterval(this._timeoutHandlerId);
            }
        },

        /**
         * Add one item to the waiting count.
         * 
         * @return {Object}
         */
        begin: function() {

            if (!this.isWaiting()) {
                this.trigger('wait');
            }

            this._waitCount++;

            if (this._callbackHandle) {
                clearTimeout(this._callbackHandle);
                this._callbackHandle = null;
            }

            this.startTimer();

            return this;

        },

        /**
         * Remove an item from the waiting count and trigger ready asynchronously if no more items are waiting.
         * 
         * @return {Object}
         */
        end: function() {

            if (!this.isWaiting()) {
                return this;
            }

            this._waitCount--;

            if (this._waitCount === 0) {
                this.stopTimer();
            }

            if (this.isWaiting()) {
                return this;
            }
            
            if (this._callbackHandle) {
                return this;
            }

            this._callbackHandle = setTimeout(function() {

                this._callbackHandle = null;
                this.trigger('ready');

            }.bind(this), 0);

            return this;

        },

        /**
         * Queue this function until all open waits have been ended.
         * 
         * @param  {Function} callback
         * @return {Object}
         */
        queue: function(callback) {

            this.begin();
            this.once('ready', callback);
            this.end();

            return this;

        },

        /**
         * Wait for this asynchronous function to execute before triggering ready event.
         * 
         * @param  {Function} callback   [ Function to execute whilst holding queued callback. Once complete run first argument, done(). ]
         * @return {Object}
         */
        for: function(callback) {

            this.begin();
            _.defer(function() {
                callback(_.once(this.end));
            }.bind(this));

            return this;

        }

    });

    return Wait;

});
