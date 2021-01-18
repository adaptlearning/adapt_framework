export default class FocusOptions {

  /**
   * Options parser for focus functions.
   * @param {Object} options
   * @param {boolean} [options.preventScroll=false] Stops the browser from scrolling to the focused point. https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus
   * @param {boolean} [options.defer=false] Add a defer to the focus call, allowing for user interface settling.
   */
  constructor({
    preventScroll = false,
    defer = false
  } = {}) {
    /**
    * Stops the browser from scrolling to the focused point.
    * https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus
    * @type {boolean}
    */
    this.preventScroll = preventScroll;
    /**
     * Add a defer to the focus call, allowing for user interface settling.
     * @type {boolean}
     */
    this.defer = defer;
  }

}
