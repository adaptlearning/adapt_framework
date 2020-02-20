define([
  'core/js/adapt'
], function(Adapt) {

  /**
   * Browser modifications to focus handling.
   * @class
   */
  var BrowserFocus = Backbone.Controller.extend({

    initialize: function() {
      _.bindAll(this, '_onBlur', '_onClick');
      this.$body = $('body');
      this.listenTo(Adapt, {
        'accessibility:ready': this._attachEventListeners
      });
    },

    _attachEventListeners: function() {
      this.$body
        .on('blur', '*', this._onBlur)
        .on('blur', this._onBlur);
      // 'Capture' event attachment for click
      this.$body[0].addEventListener('click', this._onClick, true);
    },

    /**
     * When any element in the document receives a blur event,
     * check to see if it needs the `data-a11y-force-focus` attribute removing
     * and check to see if it was blurred because a disabled attribute was added.
     * If a disabled attribute was added, the focus will be moved forward.
     *
     * @param {JQuery.Event} event
     */
    _onBlur: function(event) {
      var config = Adapt.a11y.config;
      if (!config._isEnabled || !config._options._isFocusNextOnDisabled) {
        return;
      }
      var $element = $(event.target);
      if ($element.is('[data-a11y-force-focus]')) {
        _.defer(function() {
          $element.removeAttr('tabindex data-a11y-force-focus');
        });
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
    },

    /**
     * Force focus when clicked on a tabbable element,
     * making sure `document.activeElement` is updated.
     *
     * @param {JQuery.Event} event
     */
    _onClick: function(event) {
      var config = Adapt.a11y.config;
      if (!config._isEnabled || !config._options._isFocusOnClickEnabled) {
        return;
      }
      var $element = $(event.target);
      var $stack = $().add($element).add($element.parents());
      var $focusable = $stack.filter(config._options._tabbableElements);
      if (!$focusable.length) {
        return;
      }
      // Force focus for screen reader enter / space press
      $focusable[0].focus();
    }

  });

  return BrowserFocus;

});
