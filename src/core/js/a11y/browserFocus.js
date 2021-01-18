import Adapt from 'core/js/adapt';

/**
 * Browser modifications to focus handling.
 * @class
 */
export default class BrowserFocus extends Backbone.Controller {

  initialize() {
    this._onBlur = this._onBlur.bind(this);
    this._onClick = this._onClick.bind(this);
    this.$body = $('body');
    this.listenTo(Adapt, {
      'accessibility:ready': this._attachEventListeners
    });
  }

  _attachEventListeners() {
    this.$body
      .on('blur', '*', this._onBlur)
      .on('blur', this._onBlur);
    // 'Capture' event attachment for click
    this.$body[0].addEventListener('click', this._onClick, true);
  }

  /**
   * When any element in the document receives a blur event,
   * check to see if it needs the `data-a11y-force-focus` attribute removing
   * and check to see if it was blurred because a disabled attribute was added.
   * If a disabled attribute was added, the focus will be moved forward.
   *
   * @param {JQuery.Event} event
   */
  _onBlur(event) {
    const config = Adapt.a11y.config;
    if (!config._isEnabled || !config._options._isFocusNextOnDisabled) {
      return;
    }
    const $element = $(event.target);
    if ($element.is('[data-a11y-force-focus]')) {
      _.defer(() => $element.removeAttr('tabindex data-a11y-force-focus'));
    }
    // From here, only check source elements
    if (event.target !== event.currentTarget) {
      return;
    }
    // Check if element losing focus is losing focus
    // due to the addition of a disabled class
    if (!$element.is('[disabled]')) {
      return;
    }
    // Move focus to next readable element
    Adapt.a11y.focusNext($element);
  }

  /**
   * Force focus when clicked on a tabbable element,
   * making sure `document.activeElement` is updated.
   * Stop event handling on aria-disabled elements.
   *
   * @param {JQuery.Event} event
   */
  _onClick(event) {
    const $element = $(event.target);
    if ($element.is('[aria-disabled=true]')) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
    const config = Adapt.a11y.config;
    if (!config._isEnabled || !config._options._isFocusOnClickEnabled) {
      return;
    }
    const $stack = $().add($element).add($element.parents());
    const $focusable = $stack.filter(config._options._tabbableElements);
    if (!$focusable.length) {
      return;
    }
    // Force focus for screen reader enter / space press
    $focusable[0].focus();
  }

}
