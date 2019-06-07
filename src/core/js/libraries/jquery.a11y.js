define([
  'jquery',
  'underscore'
], function($, _) {

  var iOS = /iPad|iPhone|iPod/.test(navigator.platform);

  // JQUERY FILTERS FOR ELEMENTS
    var domFilters = {
      "globalTabIndexElementFilter": ':not(.a11y-ignore):not([data-a11y-force-focus])',
      "focusableElementsFilter": ":visible:not(.is-disabled):not(:disabled):not([aria-hidden=true]):not(.a11y-ignore-focus)",
      "ariaLabelElementsFilter": ":not( .a11y-ignore-aria [aria-label] )",
      "ariaHiddenParentsFilter": ":not(#wrapper):not(body)"
    };

  // JQUERY SELECTORS
    var domSelectors = {
      "focuser": "#a11y-focuser",
      "focusguard": ".a11y-focusguard",
      "ignoreFocusElements": ".a11y-ignore-focus",
      "nativeSpaceElements": "textarea, input[type='text'], div[contenteditable=true]",
      "nativeEnterElements": "textarea, a, button, input[type='checkbox'], input[type='radio']",
      "nativeTabElements": "textarea, input, select",
      "wrapIgnoreElements": "a,button,input,select,textarea",
      "wrapStyleElements": "b,i,abbr,strong,em,small,sub,sup,ins,del,mark,zw,nb",
      "globalTabIndexElements": 'a,button,input,select,textarea,[tabindex]:not([data-a11y-force-focus])',
      "focusableElements": "a,button,input,select,textarea,[tabindex],label",
      "focusableElementsAccessible": ":not(a,button,input,select,textarea)[tabindex]",
      "hideableElements": ".a11y-hideable",
      "ariaLabelElements": "div[aria-label], span[aria-label]",
      "readableElements": "[role=heading],[aria-label],[aria-labelledby],[alt]"
    };

  // JQUERY INJECTED ELEMENTS
    var domInjectElements = {
      "focuser": '<div id="a11y-focuser" class="a11y-ignore" tabindex="-1" role="presentation">&nbsp;</div>'
    };


  // UTILITY FUNCTIONS
    function stringTrim(str) {
      return str.replace(stringTrim.regex, '');
    }
    stringTrim.regex = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;

    function defer(func, that, t) {
      var thisHandle = that || this;
      var args = arguments;
      return setTimeout(function() {
        func.apply(thisHandle, args);
      }, t||0);
    }

    function preventDefault(event) {
      if ($.a11y.options.isDebug) console.log("preventDefault");
      event.preventDefault();
      event.stopPropagation();
    }

    function preventScroll(event) {
      var state = $.a11y.state;
      var options = $.a11y.options;

      if (options.isDebug) console.log("preventScroll1")

      if (state.scrollDisabledElements && state.scrollDisabledElements.length > 0) {
        var scrollingParent = getScrollingParent(event);
        if (scrollingParent.filter(state.scrollDisabledElements).length === 0) {
          $(window).scroll();
          return;
        }
      }

      if (options.isDebug) console.log("preventScroll2")

      event.preventDefault();
      return false;
    }

    var scrollKeys = {37: 1, 38: 1, 39: 1, 40: 1};
    function preventScrollKeys(event) {
      var state = $.a11y.state;
      var options = $.a11y.options;

      if ($(event.target).is( domSelectors.nativeTabElements )) return;

      if (options.isDebug) console.log("preventScroll1")

      if (state.scrollDisabledElements && state.scrollDisabledElements.length > 0) {
        var scrollingParent = getScrollingParent(event);
        if (scrollingParent.filter(state.scrollDisabledElements).length === 0) return;
      }

      if (options.isDebug) console.log("preventScroll2")

      if (scrollKeys[event.keyCode]) {
        preventScroll(event);
        return false;
      }
    }

    function getScrollingParent(event) {
      var $element = $(event.target);

      var isTouchEvent = event.type == "touchmove";

      var deltaY;
      var directionY;

      if (isTouchEvent) {
        //touch events

        var state = $.a11y.state;
        if (!state.scrollStartEvent || !state.scrollStartEvent.originalEvent ) return $element;

        //iOS previous + current scroll pos
        var currentY = event.originalEvent.pageY;
        var previousY = state.scrollStartEvent.originalEvent.pageY;

        if (currentY === 0 || currentY == previousY) {
          //android chrome current scroll pos
          currentY = event.originalEvent.touches[0].pageY;
          previousY = state.scrollStartEvent.originalEvent.touches[0].pageY;
        }

        //touch: delta calculated from touchstart pos vs touchmove pos
        deltaY = currentY - previousY;
        if (deltaY === 0) return $('body');

        directionY = deltaY > 0 ? "up" : "down";

      } else {

        //mouse events

        //desktop: chrome & safari delta || firefox & ie delta inverted
        deltaY = event.originalEvent.wheelDeltaY || event.originalEvent.deltaY !== undefined ? -event.originalEvent.deltaY : event.originalEvent.wheelDelta || undefined;
        if (deltaY === 0) return $('body');

        directionY = deltaY > 0 ? "up" : "down";

      }

      var itemParents = $element.parents();
      var lastScrolling = null;
      for (var i = 0, l = itemParents.length; i < l; i++) {
        var $parent = $(itemParents[i]);
        if ($parent.is("body")) return $parent;
        var scrollType = $parent.css("overflow-y");
        switch (scrollType){
        case "auto": case "scroll":
          var parentScrollTop = Math.ceil($parent.scrollTop());
          var parentInnerHeight = $parent.outerHeight();
          var parentScrollHeight = $parent[0].scrollHeight;

          switch (directionY) {
          case "down":
            if (parentScrollTop + parentInnerHeight < parentScrollHeight) return $parent;
            break;
          case "up":
           if (parentScrollTop > 0) return $parent;
          }

          lastScrolling = $parent;

          break;
        default:
        }
      }
      return $('body');
    }

  // JQUERY UTILITY FUNCTIONS
    $.fn.scrollDisable = function() {
      if (this.length === 0) return this;

      var options = $.a11y.options;
      var state = $.a11y.state;

      if (!options.isScrollDisableEnabled) return this;

      if (!state.scrollDisabledElements) state.scrollDisabledElements = $(this);
      else state.scrollDisabledElements = state.scrollDisabledElements.add(this);

      if (state.scrollDisabledElements.length > 0) a11y_setupScrollListeners();

      return this;
    }

    $.fn.scrollEnable = function() {
      if (this.length === 0) return this;

      var options = $.a11y.options;
      var state = $.a11y.state;

      if (!options.isScrollDisableEnabled) return this;

      if (!state.scrollDisabledElements) return;

      state.scrollDisabledElements = state.scrollDisabledElements.not(this);

      if (state.scrollDisabledElements.length === 0) a11y_removeScrollListeners();

    }

    $.fn.isFixedPostion = function() {
      if (this.length === 0) return false;

      var $element = $(this[0]);

      if (!$element) return false;

      if ($element.css("position") == "fixed") return true;
      if ($element.is(".fixed")) return true;
      var parents = $element.parents();
      for (var i = 0, l = parents.length; i < l; i++) {
        if ($(parents[i]).css("position") == "fixed") return true;
        if ($(parents[i]).is(".fixed")) return true;
      }
      return false;
    };

    $.fn.limitedScrollTo = function() {
      console.warn("REMOVED $.limitedScrollTo had no impact on the screen reader cursor.");
      return this;
    };

    //jQuery function to focus with no scroll (accessibility requirement for control focus)
    $.fn.focusNoScroll = function() {
      if (this.length === 0) return this;

      var options = $.a11y.options;
      if (options.isDebug) console.log("focusNoScroll", this[0]);

      var y = $(window).scrollTop();
      try {
      if (this.attr('tabindex') === undefined) {
        this.attr({
          "tabindex": "-1",
          "data-a11y-force-focus": "true"
        });
      }
      this[0].focus();
      } catch(e){}
      window.scrollTo(null, y);
      return this; //chainability
    };

    /**
     * Focus on the first readable element excluding the subject
     */
    $.fn.focusNext = function(returnOnly) {
      if (this.length === 0) return this;
      var $element = $(this[0]);
      var $found = $element.findForward(function($tag) {
        return $tag.isReadable();
      });
      $found = $found || $element.not('*');
      if (!returnOnly && $found)  $found.focusNoScroll();
      return $found;
    };

    /**
     * Focus on the first readable element including the subject
     */
    $.fn.focusOrNext = function(returnOnly) {
      if (this.length === 0) return this;
      var $found;
      var $element = $(this[0]);
      if (!$element.isReadable(true)) {
        $found = $element.findForward(function($tag) {
          return $tag.isReadable();
        });
      }
      $found = $found || $element;
      if (!returnOnly && $found)  $found.focusNoScroll();
      return $found;
    };

    /**
     * Search forward in the DOM, descending and ascending to move forward
     * as appropriate.
     *
     * iterator returns true, false or undefined.
     * true: match this item
     * false: do not match or descend into this item
     * undefined: do not match, descend into this item
     */
    $.fn.findForward = function(selector) {
      // make sure iterator is correct, use boolean or selector comparison
      // appropriately
      var iterator;
      switch (typeof selector) {
        case "string":
          // make selector iterator
          iterator = function($tag) {
            return $tag.is(selector) || undefined;
          };
          break;
        case "function":
          iterator = selector;
          break;
        case "undefined":
          // find first next element
          iterator = Boolean;
      }

      if (this.length === 0) return this.not('*');

      // check children by walking the tree
      var $found = this.findWalk(iterator);
      if ($found && $found.length) return $found;

      // check subsequent siblings
      var $nextSiblings = this.nextAll().toArray();
      _.find($nextSiblings, function(sibling) {
        var $sibling = $(sibling);
        var value = iterator($sibling);

        // skip this sibling if explicitly instructed
        if (value === false) return;

        if (value) {
          // sibling matched
          $found = $sibling;
          return true;
        }

        // check parent sibling children by walking the tree
        $found = $sibling.findWalk(iterator);
        if ($found && $found.length) return true;
      });
      if ($found && $found.length) return $found;

      // move through parents towards the body element
      var $branch = this.add(this.parents()).toArray().reverse();
      _.find($branch, function(parent) {
        var $parent = $(parent);
        if (iterator($parent) === false) {
          // skip this parent if explicitly instructed
          return false;
        }

        // move through parents nextAll siblings
        var $siblings = $parent.nextAll().toArray();
        return _.find($siblings, function(sibling) {
          var $sibling = $(sibling);
          var value = iterator($sibling);

          // skip this sibling if explicitly instructed
          if (value === false) return;

          if (value) {
            // sibling matched
            $found = $sibling;
            return true;
          }

          // check parent sibling children by walking the tree
          $found = $sibling.findWalk(iterator);
          if ($found && $found.length) return true;
        });
      });

      if (!$found || !$found.length) return this.not('*');
      return $found;
    };

    /**
     * Search a DOM tree, work from parent to branch-end, through allowed
     * branch structures and in hierarchy order
     *
     * iterator returns true, false or undefined.
     * true: match this item
     * false: do not match or descend into this item
     * undefined: do not match, descend into this item
     */
    $.fn.findWalk = function(selector) {

      // make sure iterator is correct, use boolean or selector comparison
      // appropriately
      var iterator;
      switch (typeof selector) {
        case "string":
          // make selector iterator
          iterator = function($tag) {
            return $tag.is(selector) || undefined;
          };
          break;
        case "function":
          iterator = selector;
          break;
        case "undefined":
          // find first next element
          iterator = Boolean;
      }


      var $notFound = this.not('*');
      if (this.length === 0) return $notFound;

      // keep walked+passed children in a stack
      var stack = [{
        item: this[0],
        value: undefined
      }];
      var i = 0;
      var c = i+1;
      do {

        var stackEntry = stack[i];
        var $stackItem = $(stackEntry.item);

        // check current item
        switch (stackEntry.value) {
          case true:
            return $stackItem;
          case false:
            return $notFound;
        }

        // get i stack children
        var $children = $stackItem.children().toArray();
        _.find($children, function(item) {
          var $item = $(item);
          var value = iterator($item);

          // item explicitly not allowed, don't add to stack,
          // skip children
          if (value === false) return false;

          // item passed or readable, add to stack before any parent
          // siblings
          stack.splice(c++, 0, {
            item: item,
            value: value
          });
        });

        // move to next stack item
        i++;
        // keep place to inject children
        c = i+1;
      } while (i < stack.length)

      return $notFound;
    };

    /**
     * Check if item is readable by a screen reader.
     */
    $.fn.isReadable = function(checkParents) {
      var firstItem = this[0];
      var $firstItem = $(firstItem);

      var $branch =  checkParents
          ? $firstItem.add($firstItem.parents())
          : $firstItem;

      var isNotVisible = _.find($branch.toArray(), function(item) {
        var $item = $(item);
        // make sure item is not explicitly invisible
        var isNotVisible = $item.css('display') === "none"
            || $item.css('visibility') === "hidden"
            || $item.attr('aria-hidden') === "true";
        if (isNotVisible) return true;
      });
      if (isNotVisible) return false;

      // check that the component is natively tabbable or
      // will be knowingly read by a screen reader
      var hasNativeFocusOrIsScreenReadable = $firstItem.is(domSelectors.focusableElements)
          || $firstItem.is(domSelectors.readableElements);
      if (hasNativeFocusOrIsScreenReadable) return true;
      var childNodes = firstItem.childNodes;
      for (var c = 0, cl = childNodes.length; c < cl; c++) {
        var childNode = childNodes[c];
        var isTextNode = (childNode.nodeType === 3);
        if (!isTextNode) continue;
        var isOnlyWhiteSpace = /^\s*$/.test(childNode.nodeValue);
        if (isOnlyWhiteSpace) continue;
        return true;
      }

    };

  // PRIVATE EVENT HANDLERS
    function onClick(event) {
      var options = $.a11y.options;
      var $element = $(event.target);
      var $stack = $().add($element).add($element.parents());
      var $focusable = $stack.filter(domSelectors.globalTabIndexElements);
      if (!$focusable.length) return;
      // Force focus for screen reader enter / space press
      if (options.isDebug) console.log("clicked", $focusable[0]);
      $focusable[0].focus();
    }

    function onFocus(event) {
      var options = $.a11y.options;
      var state = $.a11y.state;

      var $element = $(event.target);

      if (!$element.is(domSelectors.globalTabIndexElements)) return;
      a11y_triggerReadEvent($element);

      if (options.isDebug) console.log("focus", $element[0]);

      state.$activeElement = $(event.target);
    }

    function onBlur(event) {
      var element = event.target;
      var $element = $(element);

      if ($element.is('[data-a11y-force-focus]')) {
        $element.removeAttr('tabindex data-a11y-force-focus');
      }

      // From here, only check source elements
      if (event.target !== event.currentTarget) return;

      // Check if element losing focus is losing focus
      // due to the addition of a disabled class
      if ($element.is("[disabled]")) {
        // Move focus to next readable element
        $element.focusNext();
      }
    }

    function onScrollStartCapture(event) {
      var state = $.a11y.state;
      state.scrollStartEvent = event;
      return true;
    }

    function onScrollEndCapture(event) {
      var state = $.a11y.state;
      state.scrollStartEvent = null;
      return true;
    }

    function nativePreventScroll(event) {
      // Intermediate function to turn the native event object into a jquery event object.
      // preventScroll function is expecting a jquery event object.
      return preventScroll($.event.fix(event));
    }

  // PRIVATE $.a11y FUNCTIONS
    function a11y_setupScrollListeners() {
      var scrollEventName = "wheel mousewheel";
      $(window).on(scrollEventName, preventScroll);
      $(document).on(scrollEventName, preventScroll);
      $(window).on("touchstart", onScrollStartCapture); // mobile
      window.addEventListener("touchmove", nativePreventScroll, { passive:false }); // mobile
      $(window).on("touchend", onScrollEndCapture); // mobile
      $(document).on("keydown", preventScrollKeys);
    }

    function a11y_removeScrollListeners() {
      var scrollEventName = "wheel mousewheel";
      $(window).off(scrollEventName, preventScroll);
      $(document).off(scrollEventName, preventScroll);
      $(window).off("touchstart", onScrollStartCapture); // mobile
      window.removeEventListener("touchmove", nativePreventScroll); // mobile
      $(window).off("touchend", onScrollEndCapture); // mobile
      $(document).off("keydown", preventScrollKeys);
    }

    function a11y_triggerReadEvent($element) {
      var readText;
      if ($element.attr("aria-labelledby")) {
        var label = $("#"+$element.attr("aria-labelledby"));
        readText = label.attr("aria-label") || label.text();
      } else readText = $element.attr("aria-label") || $element.text();

      $(document).trigger("reading", stringTrim(readText));
    }

    function a11y_setupFocusControlListeners() {
      var options = $.a11y.options;
      var $body = $('body');
      $body
          .off('focus', '*', onFocus)
          .off('blur', '*', onBlur)
          .off('focus', onFocus)
          .off("blur", onBlur);

      $body
          .on('focus', '*', onFocus)
          .on('blur', '*', onBlur)
          .on('focus', onFocus)
          .on("blur", onBlur);

      // "Capture" event attachment for click
      $body[0].removeEventListener('click', onClick);
      $body[0].addEventListener('click', onClick, true);
    }

    function a11y_setupFocusGuard() {
      var options = $.a11y.options;

      if ($.a11y.state.isFocusGuardSetup) return;

      $.a11y.state.isFocusGuardSetup = true;

      $('body').on("click focus", domSelectors.focusguard, function(event) {

        if (options.isDebug) console.log ("focusguard");

        preventDefault(event)
        $.a11y_focus(true);

        return false;

      });
    }

    function a11y_injectControlElements() {
      if ($(domSelectors.focuser).length === 0)$('body').append($(domInjectElements.focuser))
    }

    function a11y_removeNotAccessibles() {
      //STOP ELEMENTS WITH .not-accessible CLASS FROM BEING IN TAB INDEX
      $(".not-accessible[tabindex='0'], .not-accessible [tabindex='0']").attr({
        "tabindex": "-1",
        "aria-hidden": true
      }).addClass("aria-hidden");
    }

    //TURN ON ACCESSIBILITY FEATURES
    $.a11y = function(isOn, options) {
      if ($.a11y.options.isDebug) console.log("$.a11y called", isOn, options )
      return this;
    };

    $.a11y.options = {
      OS: "",
      isFocusControlEnabled: true,
      isRemoveNotAccessiblesEnabled: true,
      isScrollDisableEnabled: true,
      isScrollDisabledOnPopupEnabled: false,
      isDebug: false
    };
    $.a11y.state = {
      $activeElement: null,
      floorStack: [$("body")],
      focusStack: [],
      tabIndexes: {},
      ariaHiddens: {},
      elementUIDIndex: 0,
      scrollDisabledElements: null,
      scrollStartEvent: null
    };

    $.a11y.ready = function() {
      var options = $.a11y.options;

      if (iOS) options.OS = "mac";

      a11y_injectControlElements();
      a11y_setupFocusGuard();

      if (options.isFocusControlEnabled) {
        a11y_setupFocusControlListeners();
      }

    };

    //REAPPLY ON SIGNIFICANT VIEW CHANGES
    $.a11y_update = function() {
      var options = $.a11y.options;

      if (iOS) options.OS = "mac";

      if (options.isRemoveNotAccessiblesEnabled) {
        a11y_removeNotAccessibles();
      }

      if (options.isDebug) console.log("a11y_update");
    };

  //TOGGLE ACCESSIBILITY
    //MAKES CHILDREN ACCESSIBLE OR NOT
    $.a11y_on = function(isOn, selector) {
      var options = $.a11y.options;

      if (options.isDebug) console.log("$.a11y_on called", isOn, selector );

      selector = selector || 'body';
      isOn = isOn === undefined ? true : isOn;
      if (isOn === false) {
        $(selector).attr("aria-hidden", true);
      } else {
        $(selector).removeAttr("aria-hidden");
      }
      return this;
    };

    $.fn.a11y_on = function(isOn) {
      if (this.length === 0) return this;

      var options = $.a11y.options;

      if (options.isDebug) console.log("$.fn.a11y_on called", isOn, this );

      isOn = isOn === undefined ? true : isOn;
      if (isOn) {
        this.find(domSelectors.hideableElements).filter(domFilters.globalTabIndexElementFilter).attr("aria-hidden", "true").attr("tabindex", "-1").addClass("aria-hidden");
      } else {
        this.find(domSelectors.hideableElements).filter(domFilters.globalTabIndexElementFilter).attr("aria-hidden", "false").removeAttr("tabindex").removeClass("aria-hidden");
      }
      this.find(domSelectors.globalTabIndexElements).filter(domFilters.globalTabIndexElementFilter).a11y_cntrl(isOn);
      return this;
    };


  //MAKE ACCESSIBLE CONTROLS


    //MAKES NAVIGATION CONTROLS ACCESSIBLE OR NOT WITH OPTIONAL DISABLE CLASS AND ATTRIBUTE
    $.fn.a11y_cntrl = function(enabled, withDisabled) {
      if (this.length === 0) return this;

      var options = $.a11y.options;

      enabled = enabled === undefined ? true : enabled;

      for (var i = 0; i < this.length; i++) {
        var $item = $(this[i]);

        if (enabled && $item.is(domSelectors.hideableElements)) {
          $item.removeAttr("aria-hidden").removeClass("aria-hidden");
          $item.parents(domFilters.parentsFilter).removeAttr("aria-hidden").removeClass("aria-hidden");
          if (withDisabled) {
            $item.removeAttr("disabled").removeClass("is-disabled");
          }
        } else if (enabled) {
          $item.attr({
            tabindex: "0",
          }).removeAttr("aria-hidden").removeClass("aria-hidden");
          $item.parents(domFilters.parentsFilter).removeAttr("aria-hidden").removeClass("aria-hidden");
          if (withDisabled) {
            $item.removeAttr("disabled").removeClass("is-disabled");
          }
        } else {
          $item.attr({
            tabindex: "-1",
            "aria-hidden": "true"
          }).addClass("aria-hidden");
          if (withDisabled) {
            $item.attr("disabled","disabled").addClass("is-disabled");
          }
        }

      }
      return this;
    };

    //MAKES NAVIGATION CONTROLS ACCESSIBLE OR NOT WITH DISABLE CLASS AND ATTRIBUTE
    $.fn.a11y_cntrl_enabled = function(enabled) {
      if (this.length === 0) return this;
      return this.a11y_cntrl(enabled, true);
    };


  //MAKE ACCESSIBLE TEXT

    var htmlCharRegex = /&.*;/g
    $.a11y_normalize = function(text) {
      var options = $.a11y.options;

      //USED SPECIFICALLY FOR CONVERTING TITLE TEXT TO ARIA-LABELS
      var text = $("<div>" + text + "</div>").text();
      //REMOVE HTML CHARACTERS SUCH AS &apos;
      text = text.replace(htmlCharRegex,"");
      return text;
    }

    /**
     * Remove all html which causes the screen reader to pause
     * Good for converting title text to aria labels
     * @param  {string} text any html string
     * @return {string} returns html string without markup which would cause screen reader to pause
     */
    $.a11y_remove_breaks = function(text) {
      var options = $.a11y.options;

      var $div = $("<div>" + text + "</div>");
      var stack = [ $div[0] ];
      var stackIndex = 0;

      var outputs = [];
      do {

        if (stack[stackIndex].childNodes.length) {
          var nodes = stack[stackIndex].childNodes;
          var usable = _.filter(nodes, function(node) {
            if (node.nodeType === 3) return true;
            if ($(node).is(domSelectors.wrapStyleElements)) return true;
            return false;
          });
          outputs.push.apply(outputs, usable);
          stack.push.apply(stack, nodes);
        }
        stackIndex++;

      } while (stackIndex < stack.length)

      var rtnText = "";
      outputs.forEach(function(item) {
        rtnText+=item.outerHTML||item.textContent;
      });

      return rtnText;
    };

    //CONVERTS HTML OR TEXT STRING TO ACCESSIBLE HTML STRING
    $.a11y_text = function (text) {
      console.log("DEPRECATED: a11y_text is no longer required. https://tink.uk/understanding-screen-reader-interaction-modes/");
      return text;
    };

    //CONVERTS DOM NODE TEXT TO ACCESSIBLE DOM NODES
    $.fn.a11y_text = function(text) {
      console.log("DEPRECATED: a11y_text is no longer required. https://tink.uk/understanding-screen-reader-interaction-modes/");
      return this;
    };



  //MAKE SELECTED

    $.fn.a11y_selected = function(isOn, noFocus) {
      console.log("REMOVED - $.fn.a11y_selected is removed. Please use aria-live instead.");
      return this;
    };

    $.a11y_alert = function(text) {
      console.log("REMOVED - $.a11y_alert is removed. Please use aria-live instead.");
      return this;
    };


  //FOCUS RESTRICTION

    //ALLOWS FOCUS ON SELECTED ELEMENTS ONLY
    $.fn.a11y_only = function(container, storeLastTabIndex) {
      if (this.length === 0) return this;

      var state = $.a11y.state;

      if (storeLastTabIndex) {
        state.focusStack.push(state.$activeElement);
      }
      var $elements;
      var $hideable;
      if (container !== undefined) {
        $elements = $(container).find(domSelectors.globalTabIndexElements).filter(domFilters.globalTabIndexElementFilter);
        $hideable = $(container).find(domSelectors.hideableElements).filter(domFilters.globalTabIndexElementFilter);
      } else {
        $elements = $(domSelectors.globalTabIndexElements).filter(domFilters.globalTabIndexElementFilter);
        $hideable = $(domSelectors.hideableElements).filter(domFilters.globalTabIndexElementFilter);
      }

      var $branch = this.add(this.parents());
      var $siblings = $branch.siblings().filter(domFilters.globalTabIndexElementFilter);
      $elements = $elements.add($siblings);

      $elements.each(function(index, item) {
        var $item = $(item);

        var elementUID;
        if (item.a11y_uid == undefined) {
          item.a11y_uid = "UID" + ++state.elementUIDIndex;
        }
        elementUID = item.a11y_uid;

        if (storeLastTabIndex) {
          if (state.tabIndexes[elementUID] === undefined) state.tabIndexes[elementUID] = [];
          if (state.ariaHiddens[elementUID] === undefined) state.ariaHiddens[elementUID] = [];
          var tabindex = $item.attr('tabindex');
          var ariaHidden = $item.attr('aria-hidden');
          state.tabIndexes[elementUID].push( tabindex === undefined ? "" : tabindex );
          state.ariaHiddens[elementUID].push( ariaHidden === undefined ? "" : ariaHidden);
        }

        $item.attr({
          'tabindex': -1,
          'aria-hidden': true
        });
      });

      $hideable.attr("aria-hidden", true).attr("tabindex", "-1");

      this.find(domSelectors.globalTabIndexElements).filter(domFilters.globalTabIndexElementFilter).attr({
        'tabindex': 0
      }).removeAttr('aria-hidden').removeClass("aria-hidden").parents(domFilters.ariaHiddenParentsFilter).removeAttr('aria-hidden').removeClass("aria-hidden");
      this.find(domSelectors.hideableElements).filter(domFilters.globalTabIndexElementFilter).removeAttr("tabindex").removeAttr('aria-hidden').removeClass("aria-hidden").parents(domFilters.parentsFilter).removeAttr('aria-hidden').removeClass("aria-hidden");

      $.a11y_update();

      return this;
    };

    //ALLOWS RESTORATIVE FOCUS ON SELECTED ELEMENTS ONLY
    $.fn.a11y_popup = function(container) {
      if (this.length === 0) return this;

      var options = $.a11y.options;

      $.a11y.state.floorStack.push(this);

      this.a11y_only(container, true);

      if (options.isScrollDisabledOnPopupEnabled) {
        $('html').css('overflow-y', 'hidden');

        $.a11y.state.floorStack[$.a11y.state.floorStack.length-2].scrollDisable();
      }

      return this;

    };

    //RESTORES FOCUS TO PREVIOUS STATE AFTER a11y_popup
    $.a11y_popdown = function() {
      var options = $.a11y.options;
      var state = $.a11y.state;

      // the body layer is the first element and must always exist
      if ($.a11y.state.floorStack.length <= 1) return;

      var $currentFloor = $.a11y.state.floorStack.pop();

      $(domSelectors.globalTabIndexElements).filter(domFilters.globalTabIndexElementFilter).each(function(index, item) {
        var $item = $(item);
        var previousTabIndex = "";
        var previousAriaHidden = "";

        var elementUID;
        if (item.a11y_uid == undefined) {
          //assign element a unique id
          item.a11y_uid = "UID" + ++state.elementUIDIndex;
        }
        elementUID = item.a11y_uid;


        if (state.tabIndexes[elementUID] !== undefined && state.tabIndexes[elementUID].length !== 0) {
          //get previous tabindex if saved
          previousTabIndex = state.tabIndexes[elementUID].pop();
          previousAriaHidden = state.ariaHiddens[elementUID].pop();
        }
        if (state.tabIndexes[elementUID] !== undefined && state.tabIndexes[elementUID].length > 0) {
          //delete element tabindex store if empty
          delete state.tabIndexes[elementUID];
          delete state.ariaHiddens[elementUID];
        }

        if (previousTabIndex === "") {
          $item.removeAttr("tabindex");
        } else {
          $item.attr({
            'tabindex': previousTabIndex
          });
        }

        if (previousAriaHidden === "") {
          $item.removeAttr("aria-hidden");
        } else {
          $item.attr({
            'aria-hidden': previousAriaHidden
          });
        }

        if ($item.is(domSelectors.hideableElements)) {
          $item.removeAttr("tabindex");
        }
      });

      var $activeElement = state.$activeElement = state.focusStack.pop();

      $.a11y_update();

      if (options.isScrollDisabledOnPopupEnabled) {
        if (state.floorStack.length == 1) $('html').css('overflow-y', '');

        $.a11y.state.floorStack[$.a11y.state.floorStack.length-1].scrollEnable();
      }

      return $activeElement;

    };


  //SET FOCUS


    //FOCUSES ON FIRST READABLE ELEMENT
    $.a11y_focus = function(dontDefer) {
      if (dontDefer) {
        $('body').focusOrNext();
        return this;
      }

      defer(function(){
        $('body').focusOrNext();
      });
      return this;
    };

    //FOCUSES ON FIRST TABBABLE ELEMENT IN SELECTION
    $.fn.a11y_focus = function(dontDefer) {
      if (this.length === 0) return this;

      if (dontDefer) {
        this.focusOrNext();
        return this;
      }
      // FOCUS ON FIRST READABLE ELEMENT
      defer(function(){
        this.focusOrNext();
      }, this);
      return this;
    };


  //CONVERT ARIA LABELS
    //TURNS aria-label ATTRIBUTES INTO SPAN TAGS
    $.fn.a11y_aria_label = function(deep) {
      console.warn("REMOVED $.fn.a11y_aria_label incorrect behaviour.");
      return this;
    };

});
