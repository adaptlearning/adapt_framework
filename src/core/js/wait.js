export default class Wait extends Backbone.Controller {

  initialize() {
    this._waitCount = 0;
    this._callbackHandle = null;
    this.being = this.begin.bind(this);
    this.end = this.end.bind(this);
  }

  /**
   * Returns true if there are items in the waiting count.
   *
   * @return {Boolean}
   */
  isWaiting() {
    return (this._waitCount !== 0);
  }

  /**
   * Add one item to the waiting count.
   *
   * @return {Object}
   */
  begin() {
    if (!this.isWaiting()) this.trigger('wait');

    this._waitCount++;

    if (this._callbackHandle) {
      clearTimeout(this._callbackHandle);
      this._callbackHandle = null;
    }

    return this;
  }

  /**
   * Remove an item from the waiting count and trigger ready asynchronously if no more items are waiting.
   *
   * @return {Object}
   */
  end() {
    if (!this.isWaiting()) return this;

    this._waitCount--;

    if (this.isWaiting() || this._callbackHandle) return this;

    this._callbackHandle = setTimeout(function() {
      this._callbackHandle = null;
      this.trigger('ready');
    }.bind(this), 0);

    return this;
  }

  /**
   * Queue this function until all open waits have been ended.
   *
   * @param  {Function} [callback]
   * @return {Object|Promise}
   */
  queue(callback) {
    if (!callback) {
      this.begin();

      return new Promise(resolve => {
        this.once('ready', resolve);
        this.end();
      });
    }

    this.begin();
    this.once('ready', callback);
    this.end();

    return this;
  }

  /**
   * Wait for this asynchronous function to execute before triggering ready event.
   *
   * @param  {Function} callback   [ Function to execute whilst holding queued callback. Once complete run first argument, done(). ]
   * @return {Object}
   */
  for(callback) {
    this.begin();
    _.defer(() => callback(_.once(this.end)));
    return this;
  }

}
