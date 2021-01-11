import Adapt from 'core/js/adapt';

/**
 * Manages whether or not the focus outline should be entirely removed
 * or removed until a key is pressed on a tabbable element.
 * @class
 */
export default class KeyboardFocusOutline extends Backbone.Controller {

  initialize() {
    this._onKeyDown = this._onKeyDown.bind(this);
    this.$html = $('html');
    this.showOnKeys = {
      9: true, // tab
      13: true, // enter
      32: true, // space
      37: true, // arrow left
      38: true, // arrow up
      39: true, // arrow right
      40: true // arrow down
    };
    this.listenTo(Adapt, {
      'accessibility:ready': this._attachEventListeners
    });
  }

  _attachEventListeners() {
    document.addEventListener('keydown', this._onKeyDown);
    this._start();
  }

  /**
   * Add styling classes if required.
   */
  _start() {
    const config = Adapt.a11y.config;
    if (config._options._isFocusOutlineDisabled) {
      this.$html.addClass('a11y-disable-focusoutline');
      return;
    }
    if (!config._isEnabled || !config._options._isFocusOutlineKeyboardOnlyEnabled) {
      return;
    }
    this.$html.addClass('a11y-disable-focusoutline');
  }

  /**
   * Handle key down events for on a tabbable element.
   *
   * @param {JQuery.Event} event
   */
  _onKeyDown(event) {
    const config = Adapt.a11y.config;
    if (config._options._isFocusOutlineDisabled) {
      this.$html.addClass('a11y-disable-focusoutline');
      return;
    }
    if (!config._isEnabled || !config._options._isFocusOutlineKeyboardOnlyEnabled || !this.showOnKeys[event.keyCode]) {
      return;
    }
    const $element = $(event.target);
    if (!$element.is(config._options._tabbableElements) || $element.is(config._options._focusOutlineKeyboardOnlyIgnore)) {
      return;
    }
    this.$html.removeClass('a11y-disable-focusoutline');
  }

}
