/**
 * Controller for blocking scroll events on specified elements.
 * @class
 */
export default class Scroll extends Backbone.Controller {

  initialize() {
    this._onTouchStart = this._onTouchStart.bind(this);
    this._onTouchEnd = this._onTouchEnd.bind(this);
    this._onScrollEvent = this._onScrollEvent.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
    this._scrollDisabledElements = $([]);
    this.$window = $(window);
    this.$body = $('body');
    this._preventScrollOnKeys = {
      37: true, // left
      38: true, // up
      39: true, // right
      40: true // down
    };
    this._ignoreKeysOnElementsMatching = 'textarea, input, select';
    this._isRunning = false;
    this._touchStartEventObject = null;
  }

  /**
   * Block scrolling on the given elements.
   *
   * @param {Object|string|Array} $elements
   */
  disable($elements) {
    $elements = $($elements);
    this._scrollDisabledElements = this._scrollDisabledElements.add($elements);
    this._checkRunning();
    return this;
  }

  /**
   * Stop blocking scrolling on the given elements.
   *
   * @param {Object|string|Array} $items
   */
  enable($elements) {
    $elements = $($elements);
    if (!$elements.length) {
      this.clear();
      return this;
    }
    this._scrollDisabledElements = this._scrollDisabledElements.not($elements);
    this._checkRunning();
    return this;
  }

  /**
   * Stop blocking all scrolling.
   */
  clear() {
    this._scrollDisabledElements = $([]);
    this._checkRunning();
    return this;
  }

  /**
   * Start or stop listening for events to block if and when needed.
   */
  _checkRunning() {
    if (!this._scrollDisabledElements.length) {
      this._stop();
      return;
    }
    this._start();
  }

  /**
   * Start listening for events to block.
   */
  _start() {
    if (this._isRunning) {
      return;
    }
    this._isRunning = true;
    window.addEventListener('touchstart', this._onTouchStart); // mobile
    window.addEventListener('touchend', this._onTouchEnd); // mobile
    window.addEventListener('touchmove', this._onScrollEvent, { passive: false }); // mobile
    window.addEventListener('wheel', this._onScrollEvent, { passive: false });
    document.addEventListener('wheel', this._onScrollEvent, { passive: false });
    document.addEventListener('keydown', this._onKeyDown);
  }

  /**
   * Capture the touchstart event object for deltaY calculations.
   *
   * @param {JQuery.Event} event
   */
  _onTouchStart(event) {
    event = $.event.fix(event);
    this._touchStartEventObject = event;
    return true;
  }

  /**
   * Clear touchstart event object.
   */
  _onTouchEnd() {
    this._touchStartEventObject = null;
    return true;
  }

  /**
   * Process a native scroll event.
   *
   * @param {JQuery.Event} event
   */
  _onScrollEvent(event) {
    event = $.event.fix(event);
    return this._preventScroll(event);
  }

  /**
   * Process a native keydown event.
   *
   * @param {JQuery.Event} event
   */
  _onKeyDown(event) {
    event = $.event.fix(event);
    if (!this._preventScrollOnKeys[event.keyCode]) {
      return;
    }
    const $target = $(event.target);
    if ($target.is(this._ignoreKeysOnElementsMatching)) {
      return;
    }
    return this._preventScroll(event);
  }

  /**
   * Process jquery event object.
   *
   * @param {JQuery.Event} event
   */
  _preventScroll(event) {
    const isGesture = (event.touches?.length > 1);
    if (isGesture) {
      // allow multiple finger gestures through
      // this will unfortunately allow two finger background scrolling on mobile devices
      // one finger background scrolling will still be disabled
      return;
    }
    const $target = $(event.target);
    if (this._scrollDisabledElements.length) {
      const scrollingParent = this._getScrollingParent(event, $target);
      if (scrollingParent.filter(this._scrollDisabledElements).length === 0) {
        this.$window.scroll();
        return;
      }
    }
    event.preventDefault();
    return false;
  }

  /**
   * Return the parent which will be scrolling from the current scroll event.
   *
   * @param {JQuery.Event} event
   * @param {Object} $target jQuery element object.
   */
  _getScrollingParent(event, $target) {
    const isTouchEvent = event.type === 'touchmove';
    const hasTouchStartEvent = this._touchStartEventObject?.originalEvent;
    if (isTouchEvent && !hasTouchStartEvent) {
      return $target;
    }
    const directionY = this._getScrollDirection(event);
    if (directionY === 'none') {
      return this.$body;
    }
    const parents = $target.parents();
    for (let i = 0, l = parents.length; i < l; i++) {
      const $parent = $(parents[i]);
      if ($parent.is('body')) {
        return this.$body;
      }
      if (!this._isScrollable($parent)) {
        continue;
      }
      if (!this._isScrolling($parent, directionY)) {
        continue;
      }
      return $parent;
    }
    return this.$body;
  }

  /**
   * Returns true if the specified target is scrollable.
   *
   * @param {Object} $target jQuery element object.
   * @returns {boolean}
   */
  _isScrollable($target) {
    const scrollType = $target.css('overflow-y');
    if (scrollType !== 'auto' && scrollType !== 'scroll') {
      return false;
    }
    const pointerEvents = $target.css('pointer-events');
    if (pointerEvents === 'none') {
      return false;
    }
    return true;
  }

  /**
   * Returns true if the specified target is the scrolling target.
   *
   * @param {Object} $target jQuery element object.
   * @param {string} directionY 'none' | 'up' | 'down'
   *
   * @returns {boolean}
   */
  _isScrolling($target, directionY) {
    const scrollTop = Math.ceil($target.scrollTop());
    const innerHeight = $target.outerHeight();
    const scrollHeight = $target[0].scrollHeight;
    let hasScrollingSpace = false;
    switch (directionY) {
      case 'down':
        hasScrollingSpace = scrollTop + innerHeight < scrollHeight;
        if (hasScrollingSpace) {
          return true;
        }
        break;
      case 'up':
        hasScrollingSpace = scrollTop > 0;
        if (hasScrollingSpace) {
          return true;
        }
        break;
    }
    return false;
  }

  /**
   * Returns the vertical direction of scroll.
   *
   * @param {JQuery.Event} event
   * @returns {string} 'none' | 'up' | 'down'
   */
  _getScrollDirection(event) {
    const deltaY = this._getScrollDelta(event);
    if (deltaY === 0) {
      return 'none';
    }
    return deltaY > 0 ? 'up' : 'down';
  }

  /**
   * Returns the number of pixels which is intended to be scrolled.
   *
   * @param {JQuery.Event} event
   * @returns {number}
   */
  _getScrollDelta(event) {
    let deltaY = 0;
    const isTouchEvent = event.type === 'touchmove';
    const originalEvent = event.originalEvent;
    if (isTouchEvent) {
      // Touch events
      // iOS previous + current scroll pos
      const startOriginalEvent = this._touchStartEventObject.originalEvent;
      let currentY = originalEvent.pageY;
      let previousY = startOriginalEvent.pageY;
      if (currentY === 0 || currentY === previousY) {
        // Android chrome current scroll pos
        currentY = originalEvent.touches[0].pageY;
        previousY = startOriginalEvent.touches[0].pageY;
      }
      // Touch: delta calculated from touchstart pos vs touchmove pos
      deltaY = currentY - previousY;
    } else {
      // Mouse events
      const hasDeltaY = (originalEvent.wheelDeltaY || originalEvent.deltaY !== undefined);
      if (hasDeltaY) {
        // Desktop: Firefox & IE delta inverted
        deltaY = -originalEvent.deltaY;
      } else {
        // Desktop: Chrome & Safari wheel delta
        deltaY = (originalEvent.wheelDelta || 0);
      }
    }
    return deltaY;
  }

  /**
   * Stop listening for events to block.
   */
  _stop() {
    if (!this._isRunning) {
      return;
    }
    this._isRunning = false;
    window.removeEventListener('touchstart', this._onTouchStart); // mobile
    window.removeEventListener('touchend', this._onTouchEnd); // mobile
    // shouldn't need to supply 3rd arg when removing, but IE11 won't remove the event listener if you don't - see https://github.com/adaptlearning/adapt_framework/issues/2466
    window.removeEventListener('touchmove', this._onScrollEvent, { passive: false }); // mobile
    window.removeEventListener('wheel', this._onScrollEvent, { passive: false });
    document.removeEventListener('wheel', this._onScrollEvent, { passive: false });
    document.removeEventListener('keydown', this._onKeyDown);
  }

}
