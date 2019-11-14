define([
  'core/js/adapt'
], function(Adapt) {

  /**
   * Controller for managing tab wrapping for popups.
   * @class
   */
  var WrapFocus = Backbone.Controller.extend({

    initialize: function() {
      _.bindAll(this, '_onWrapAround');
      this.listenTo(Adapt, {
        'accessibility:ready': this._attachEventListeners
      });
    },

    _attachEventListeners: function() {
      var config = Adapt.a11y.config;
      $('body').on('click focus', config._options._focusguard, this._onWrapAround);
    },

    /**
     * If click or focus is received on any element with the focusguard class,
     * loop focus around to the top of the document.
     *
     * @param {JQuery.Event} event
     */
    _onWrapAround: function(event) {
      var config = Adapt.a11y.config;
      if (!config._isEnabled || !config._options._isPopupWrapFocusEnabled) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      Adapt.a11y.focusFirst('body', { defer: false });
    }

  });

  return WrapFocus;

});
