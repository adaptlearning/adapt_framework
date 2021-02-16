import Adapt from 'core/js/adapt';

/**
 * Tabindex and aria-hidden manager for popups.
 * @class
 */
export default class Popup extends Backbone.Controller {

  initialize() {
    /**
     * List of elements which form the base at which elements are generally tabbale
     * and aria-hidden='false'.
     *
     * @type {Array<Object>}
     */
    this._floorStack = [$('body')];
    /**
     * List of elements to return the focus to once leaving each stack.
     *
     * @type {Array<Object>}
     */
    this._focusStack = [];
    /**
     * Hash of tabindex states for each tabbable element in the popup stack.
     *
     * @type {Object}
     */
    this._tabIndexes = {};
    /**
     * Hash of aria-hidden states for each tabbable element in the popup stack.
     *
     * @type {Object}
     */
    this._ariaHiddens = {};
    /**
     * Incremented unique ids for elements belonging to a popup stack with saved
     * states,
     */
    this._elementUIDIndex = 0;
    this.listenTo(Adapt, {
      'popup:opened'($element, ignoreInternalTrigger) {
        if (ignoreInternalTrigger) {
          return;
        }
        Adapt.a11y.log.deprecated('Adapt.trigger("popup:opened", $element) is replaced with Adapt.a11y.popupOpened($element);');
        this.opened($element, true);
      },
      'popup:closed'($target, ignoreInternalTrigger) {
        if (ignoreInternalTrigger) {
          return;
        }
        Adapt.a11y.log.deprecated('Adapt.trigger("popup:closed", $target) is replaced with Adapt.a11y.popupClosed($target);');
        this.closed($target, true);
      }
    });
  }

  /**
   * Reorganise the tabindex and aria-hidden attributes in the document to
   * restrict user interaction to the element specified.
   *
   * @param {Object} [$popupElement] Element encapulating the popup.
   * @returns {Object} Returns `Adapt.a11y._popup`.
   */
  opened($popupElement, silent) {
    // Capture currently active element or element specified
    $popupElement = $popupElement || $(document.activeElement);
    this._addPopupLayer($popupElement);
    if (!silent) {
      Adapt.trigger('popup:opened', $popupElement, true);
    }
    return this;
  }

  /**
   * Restrict tabbing and screen reader access to selected element only.
   *
   * @param {Object} $popupElement Element encapulating the popup.
   */
  _addPopupLayer($popupElement) {
    $popupElement = $($popupElement);
    const config = Adapt.a11y.config;
    if (!config._isEnabled || !config._options._isPopupManagementEnabled || $popupElement.length === 0) {
      return $popupElement;
    }
    this._floorStack.push($popupElement);
    this._focusStack.push($(document.activeElement));
    let $elements = $(config._options._tabbableElements).filter(config._options._tabbableElementsExcludes);
    const $branch = $popupElement.add($popupElement.parents());
    const $siblings = $branch.siblings().filter(config._options._tabbableElementsExcludes);
    $elements = $elements.add($siblings);
    $elements.each((index, item) => {
      const $item = $(item);
      let elementUID;
      if (typeof item.a11y_uid === 'undefined') {
        item.a11y_uid = 'UID' + ++this._elementUIDIndex;
      }
      elementUID = item.a11y_uid;
      if (this._tabIndexes[elementUID] === undefined) {
        this._tabIndexes[elementUID] = [];
      }
      if (this._ariaHiddens[elementUID] === undefined) {
        this._ariaHiddens[elementUID] = [];
      }
      const tabindex = $item.attr('tabindex');
      const ariaHidden = $item.attr('aria-hidden');
      this._tabIndexes[elementUID].push(tabindex === undefined ? '' : tabindex);
      this._ariaHiddens[elementUID].push(ariaHidden === undefined ? '' : ariaHidden);
      if (config._options._isPopupTabIndexManagementEnabled) {
        $item.attr('tabindex', -1);
      }
      if (config._options._isPopupAriaHiddenManagementEnabled) {
        $item.attr('aria-hidden', true);
      }
    });
    const $items = $popupElement.find(config._options._tabbableElements).filter(config._options._tabbableElementsExcludes);
    if (config._options._isPopupTabIndexManagementEnabled) {
      $items.attr('tabindex', 0);
    }
    if (config._options._isPopupAriaHiddenManagementEnabled) {
      $items
        .removeAttr('aria-hidden')
        .removeClass('aria-hidden')
        .parents(config._options._ariaHiddenExcludes)
        .removeAttr('aria-hidden')
        .removeClass('aria-hidden');
    }
  }

  /**
   * Close the last popup on the stack, restoring tabindex and aria-hidden
   * attributes.
   *
   * @param {Object} [$focusElement] Element at which to move focus.
   * @returns {Object} Returns `Adapt.a11y._popup`.
   */
  closed($focusElement, silent) {
    const $previousFocusElement = this._removeLastPopupLayer();
    $focusElement = $focusElement || $previousFocusElement || $('body');
    if (!silent) {
      Adapt.trigger('popup:closed', $focusElement, true);
    }
    Adapt.a11y.focusFirst($($focusElement));
    return this;
  }

  /**
   * Restores tabbing and screen reader access to the state before the last
   * `_addPopupLayer` call.
   *
   * @returns {Object} Returns previously active element.
   */
  _removeLastPopupLayer() {
    const config = Adapt.a11y.config;
    if (!config._isEnabled || !config._options._isPopupManagementEnabled) {
      return $(document.activeElement);
    }
    // the body layer is the first element and must always exist
    if (this._floorStack.length <= 1) {
      return;
    }
    this._floorStack.pop();
    $(config._options._tabbableElements).filter(config._options._tabbableElementsExcludes).each((index, item) => {
      const $item = $(item);
      let previousTabIndex = '';
      let previousAriaHidden = '';
      let elementUID;
      if (typeof item.a11y_uid === 'undefined') {
        // assign element a unique id
        item.a11y_uid = 'UID' + ++this._elementUIDIndex;
      }
      elementUID = item.a11y_uid;
      if (this._tabIndexes[elementUID]?.length) {
        // get previous tabindex if saved
        previousTabIndex = this._tabIndexes[elementUID].pop();
        previousAriaHidden = this._ariaHiddens[elementUID].pop();
      }
      if (this._tabIndexes[elementUID]?.length) {
        // delete element tabindex store if empty
        delete this._tabIndexes[elementUID];
        delete this._ariaHiddens[elementUID];
      }
      if (config._options._isPopupTabIndexManagementEnabled) {
        if (previousTabIndex === '') {
          $item.removeAttr('tabindex');
        } else {
          $item.attr({
            'tabindex': previousTabIndex
          });
        }
      }
      if (config._options._isPopupAriaHiddenManagementEnabled) {
        if (previousAriaHidden === '') {
          $item.removeAttr('aria-hidden');
        } else {
          $item.attr({
            'aria-hidden': previousAriaHidden
          });
        }
      }
    });
    return this._focusStack.pop();
  }

  /**
   * When a popup is open, this function makes it possible to swap the element
   * that should receive focus on popup close.
   *
   * @param {Object} $focusElement Set a new element to focus on.
   * @returns {Object} Returns previously set focus element.
   */
  setCloseTo($focusElement) {
    const $original = this._focusStack.pop();
    this._focusStack.push($focusElement);
    return $original;
  }

}
