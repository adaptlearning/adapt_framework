import Adapt from 'core/js/adapt';

/**
 * The old API is rerouted to the new API with warnings.
 */

Object.assign($.fn, {

  isFixedPostion() {
    Adapt.a11y.log.removed('$("..").isFixedPostion was unneeded and has been removed, let us know if you need it back.');
    return false;
  },

  a11y_aria_label() {
    Adapt.a11y.log.removed('$("..").a11y_aria_label was incorrect behaviour.');
    return this;
  },

  limitedScrollTo() {
    Adapt.a11y.log.removed('$.limitedScrollTo had no impact on the screen reader cursor.');
    return this;
  },

  a11y_text() {
    Adapt.a11y.log.removed('a11y_text is no longer required. https://tink.uk/understanding-screen-reader-interaction-modes/');
    return this;
  },

  a11y_selected() {
    Adapt.a11y.log.removed('$("..").a11y_selected is removed. Please use aria-live instead.');
    return this;
  },

  a11y_on(isOn) {
    Adapt.a11y.log.deprecated('$("..").a11y_on, use Adapt.a11y.findTabbable($element); and Adapt.a11y.toggleAccessible($elements, isAccessible); instead.');
    const $tabbable = Adapt.a11y.findTabbable(this);
    Adapt.a11y.toggleAccessible($tabbable, isOn);
    return this;
  },

  a11y_only() {
    Adapt.a11y.log.removed('$("..").a11y_only, use Adapt.a11y.popupOpened($popupElement); instead.');
    return this;
  },

  scrollDisable() {
    if (Adapt.a11y.config._options._isScrollDisableEnabled === false) {
      return this;
    }
    Adapt.a11y.log.deprecated('$("..").scrollDisable, use Adapt.a11y.scrollDisable($elements); instead.');
    Adapt.a11y.scrollDisable(this);
    return this;
  },

  scrollEnable() {
    if (Adapt.a11y.config._options._isScrollDisableEnabled === false) {
      return this;
    }
    Adapt.a11y.log.deprecated('$("..").scrollEnable, use Adapt.a11y.scrollEnable($elements); instead.');
    Adapt.a11y.scrollEnable(this);
    return this;
  },

  a11y_popup() {
    Adapt.a11y.log.deprecated('$("..").a11y_popup, use Adapt.a11y.popupOpened($popupElement); instead.');
    return Adapt.a11y.popupOpened(this);
  },

  a11y_cntrl(isOn, withDisabled) {
    Adapt.a11y.log.deprecated('$("..").a11y_cntrl, use Adapt.a11y.toggleAccessible($elements, isAccessible); and if needed Adapt.a11y.toggleEnabled($elements, isEnabled); instead.');
    Adapt.a11y.toggleAccessible(this, isOn);
    if (withDisabled) Adapt.a11y.toggleEnabled(this, isOn);
    return this;
  },

  a11y_cntrl_enabled(isOn) {
    Adapt.a11y.log.deprecated('$("..").a11y_cntrl_enabled, use Adapt.a11y.toggleAccessibleEnabled($elements, isAccessibleEnabled); instead.');
    Adapt.a11y.toggleAccessibleEnabled(this, isOn);
    return this;
  },

  isReadable() {
    Adapt.a11y.log.deprecated('$("..").isReadable, use Adapt.a11y.isReadable($element); instead.');
    return Adapt.a11y.isReadable(this);
  },

  findForward(selector) {
    Adapt.a11y.log.removed('$("..").findForward has been removed as the use cases are very small, let us know if you need it back.');
    return Adapt.a11y._findFirstForward(this, selector);
  },

  findWalk(selector) {
    Adapt.a11y.log.removed('$("..").findWalk has been removed as the use cases are very small, let us know if you need it back.');
    return Adapt.a11y._findFindForwardDescendant(this, selector);
  },

  focusNoScroll() {
    Adapt.a11y.log.deprecated('$("..").focusNoScroll, use Adapt.a11y.focus($element); instead.');
    return Adapt.a11y.focus(this);
  },

  focusNext(returnOnly) {
    Adapt.a11y.log.deprecated('$("..").focusNext, use Adapt.a11y.focusNext($element); or if needed Adapt.a11y.findFirstReadable($element); instead.');
    if (returnOnly) {
      return Adapt.a11y.findFirstReadable(this);
    }
    return Adapt.a11y.focusNext(this);
  },

  focusOrNext(returnOnly) {
    Adapt.a11y.log.deprecated('$("..").focusOrNext, use Adapt.a11y.focusFirst($element); or if needed Adapt.a11y.findFirstReadable($element); or Adapt.a11y.isReadable($element); instead.');
    if (returnOnly) {
      if (Adapt.a11y.isReadable(this)) return this;
      return Adapt.a11y.findFirstReadable(this);
    }
    return Adapt.a11y.focusFirst(this);
  },

  a11y_focus(dontDefer) {
    Adapt.a11y.log.deprecated('$("..").a11y_focus, use Adapt.a11y.focusFirst($element, { defer: true }); instead.');
    Adapt.a11y.focusFirst(this, { defer: !dontDefer });
    return this;
  }

});

Object.assign($, {

  a11y_alert() {
    Adapt.a11y.log.removed('$.a11y_alert is removed. Please use aria-live instead.');
    return this;
  },

  a11y_update() {
    Adapt.a11y.log.removed('a11y_update is no longer required.');
    return this;
  },

  a11y_text(text) {
    Adapt.a11y.log.removed('a11y_text is no longer required. https://tink.uk/understanding-screen-reader-interaction-modes/');
    return text;
  },

  a11y_on(isOn, selector) {
    Adapt.a11y.log.deprecated('$("..").a11y_on, use Adapt.a11y.toggleHidden($elements, isHidden); instead.');
    return Adapt.a11y.toggleHidden(selector, !isOn);
  },

  a11y_popdown($focusTarget) {
    Adapt.a11y.log.removed('$.a11y_popdown, use Adapt.a11y.popupClosed($focusTarget); instead.');
    return Adapt.a11y.popupClosed($focusTarget);
  },

  a11y_focus(dontDefer) {
    Adapt.a11y.log.deprecated('$.a11y_focus, use Adapt.a11y.focusFirst("body", { defer: true }); instead.');
    Adapt.a11y.focusFirst('body', { defer: !dontDefer });
    return this;
  },

  a11y_normalize(html) {
    Adapt.a11y.log.deprecated('$.a11y_normalize, use Adapt.a11y.normalize("html"); instead.');
    return Adapt.a11y.normalize(html);
  },

  a11y_remove_breaks(html) {
    Adapt.a11y.log.deprecated('$.a11y_remove_breaks, use Adapt.a11y.removeBreaks("html"); instead.');
    return Adapt.a11y.removeBreaks(html);
  }

});
