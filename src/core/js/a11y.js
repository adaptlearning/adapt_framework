define([
  'core/js/adapt',
  './a11y/browserFocus',
  './a11y/focusOptions',
  './a11y/keyboardFocusOutline',
  './a11y/log',
  './a11y/scroll',
  './a11y/wrapFocus',
  './a11y/popup',
  './a11y/deprecated'
], function(Adapt, BrowserFocus, FocusOptions, KeyboardFocusOutline, Log, Scroll, WrapFocus, Popup) {

  var A11y = Backbone.Controller.extend({

    $html: $('html'),
    _htmlCharRegex: /&.*;/g,

    config: null,
    defaults: {

      _isFocusOutlineKeyboardOnlyEnabled: false,
      /**
       * `_isFocusOutlineDisabled` ignores `_isEnabled` and can be used when all other
       * accessibility features have been disabled.
       */
      _isFocusOutlineDisabled: false,
      _isFocusAssignmentEnabled: true,
      _isFocusOnClickEnabled: true,
      _isFocusNextOnDisabled: true,
      _isScrollDisableEnabled: true,
      _isAriaHiddenManagementEnabled: true,
      _isPopupManagementEnabled: true,
      _isPopupWrapFocusEnabled: true,
      _isPopupAriaHiddenManagementEnabled: true,
      _isPopupTabIndexManagementEnabled: true,
      /**
       * Do not change aria-hidden on these elements.
       */
      _ariaHiddenExcludes: ':not(#wrapper):not(body)',
      _tabbableElements: 'a,button,input,select,textarea,[tabindex]:not([data-a11y-force-focus])',
      /**
       * Designate these elements as not tabbable.
       */
      _tabbableElementsExcludes: ':not(.a11y-ignore):not([data-a11y-force-focus])',
      _focusableElements: 'a,button,input,select,textarea,[tabindex],label',
      _readableElements: '[role=heading],[aria-label],[aria-labelledby],[alt]',
      /**
       * Selector for elements which cause tab wrapping.
       */
      _focusguard: '.a11y-focusguard',
      /**
       * Specifies all stylistic elements.
       */
      _wrapStyleElements: 'b,i,abbr,strong,em,small,sub,sup,ins,del,mark,zw,nb',

      /**
       * Logging settings
       */
      _warnFirstOnly: true,
      _warn: true

    },

    _browserFocus: new BrowserFocus(),
    _keyboardFocusOutline: new KeyboardFocusOutline(),
    _wrapFocus: new WrapFocus(),
    _popup: new Popup(),
    _scroll: new Scroll(),

    log: new Log(),

    initialize: function() {
      this._removeLegacyElements();
      this.listenToOnce(Adapt, {
        'app:dataLoaded': this._onDataLoaded,
        'navigationView:postRender': this._removeLegacyElements
      }, this);
      Adapt.on('device:changed', this._setupNoSelect);
      this.listenTo(Adapt, {
        'router:location': this._onNavigationStart,
        'pageView:ready menuView:ready router:plugin': this._onNavigationEnd
      });
    },

    _onDataLoaded: function() {
      this.config = Adapt.config.get('_accessibility');
      this.config._isActive = false;
      this.config._options = _.defaults(this.config._options || {}, this.defaults);
      Adapt.offlineStorage.set('a11y', false);
      this.$html.toggleClass('has-accessibility', this.isEnabled());
      this._setupNoSelect();
      this._addFocuserDiv();
      if (this._isReady) {
        return;
      }
      this._isReady = true;
      Adapt.trigger('accessibility:ready');
    },

    _setupNoSelect: function() {
      if (!this.config || !this.config._disableTextSelectOnClasses) {
        return;
      }
      var classes = this.config._disableTextSelectOnClasses.split(' ');
      var isMatch = false;
      for (var i = 0, item; item = classes[i++];) {
        if (this.$html.is(item)) {
          isMatch = true;
          break;
        }
      }
      this.$html.toggleClass('u-no-select', isMatch);
    },

    _addFocuserDiv: function() {
      if ($('#a11y-focuser').length) {
        return;
      }
      $('body').append($('<div id="a11y-focuser" class="a11y-ignore" tabindex="-1" role="presentation">&nbsp;</div>'));
    },

    _removeLegacyElements: function() {
      var $legacyElements = $('body').children('#accessibility-toggle, #accessibility-instructions');
      var $navigationElements = $('.nav').find('#accessibility-toggle, #accessibility-instructions');
      if (!$legacyElements.length && !$navigationElements.length) {
        return;
      }
      Adapt.log.warn('REMOVED: #accessibility-toggle and #accessibility-instructions have been removed. Please remove them from all of your .html files.');
      $legacyElements.remove();
      $navigationElements.remove();
    },

    _onNavigationStart: function() {
      if (!this.isEnabled()) {
        return;
      }
      // Stop document reading
      _.defer(function() {
        Adapt.a11y.toggleHidden('.page, .menu', true);
      });
    },

    _onNavigationEnd: function(view) {
      // Prevent sub-menu items provoking behaviour
      if ((view && view.model && view.model.get('_id') !== Adapt.location._currentId) || !this.isEnabled())  {
        return;
      }
      // Allow document to be read
      Adapt.a11y.toggleHidden('.page, .menu', false);
    },

    isActive: function() {
      this.log.removed('Accessibility is now always active when enabled. Please unify your user experiences.');
      return false;
    },

    isEnabled: function() {
      return this.config && this.config._isEnabled;
    },

    /**
     * Adds or removes `aria-hidden` attribute to elements.
     *
     * @param {Object|string|Array} $elements
     * @param {boolean} [isHidden=true]
     * @returns {Object} Returns `Adapt.a11y`
     */
    toggleHidden: function($elements, isHidden) {
      $elements = $($elements);
      var config = Adapt.a11y.config;
      if (!config._isEnabled || !config._options._isAriaHiddenManagementEnabled) {
        return this;
      }
      isHidden = isHidden === undefined ? true : isHidden;
      if (isHidden === true) {
        $elements.attr('aria-hidden', true);
      } else {
        $elements.removeAttr('aria-hidden');
      }
      return this;
    },

    /**
     * Adds or removes `aria-hidden` and `disabled` attributes and `disabled`
     * classes to elements.
     *
     * @param {Object|string|Array} $elements
     * @param {boolean} [isHidden=true]
     * @returns {Object} Returns `Adapt.a11y`
     */
    toggleAccessibleEnabled: function($elements, isAccessibleEnabled) {
      this.toggleAccessible($elements, isAccessibleEnabled);
      this.toggleEnabled($elements, isAccessibleEnabled);
      return this;
    },

    /**
     * Adds or removes `aria-hidden` attribute and disables `tabindex` on elements.
     *
     * @param {Object|string|Array} $elements
     * @param {boolean} [isReadable=true]
     * @returns {Object} Returns `Adapt.a11y`
     */
    toggleAccessible: function($elements, isReadable) {
      $elements = $($elements);
      var config = Adapt.a11y.config;
      if (!config._isEnabled || !config._options._isAriaHiddenManagementEnabled || $elements.length === 0) {
        return this;
      }
      isReadable = isReadable === undefined ? true : isReadable;
      if (!isReadable) {
        $elements.attr({
          tabindex: '-1',
          'aria-hidden': 'true'
        }).addClass('aria-hidden');
      } else {
        $elements.removeAttr('aria-hidden tabindex').removeClass('aria-hidden');
        $elements.parents(config._options._ariaHiddenExcludes).removeAttr('aria-hidden').removeClass('aria-hidden');
      }
      return this;
    },

    /**
     * Adds or removes `disabled` attribute and `disabled` class.
     *
     * @param {Object|string|Array} $elements
     * @param {boolean} [isEnabled=true]
     * @returns {Object} Returns `Adapt.a11y`
     */
    toggleEnabled: function($elements, isEnabled) {
      $elements = $($elements);
      if ($elements.length === 0) {
        return this;
      }
      isEnabled = isEnabled === undefined ? true : isEnabled;
      if (!isEnabled) {
        $elements.attr('disabled','disabled').addClass('is-disabled');
      } else {
        $elements.removeAttr('disabled').removeClass('is-disabled');
      }
      return this;
    },

    /**
     * Find the first tabbable element after the specified element.
     *
     * @param {Object|string|Array} $element
     * @returns {Object}
     */
    findFirstTabbable: function($element) {
      $element = $($element).first();
      return this._findFirstForward($element, this.isTabbable);
    },

    /**
     * Find the first readable element after the specified element.
     *
     * @param {Object|string|Array} $element
     * @returns {Object}
     */
    findFirstReadable: function($element) {
      $element = $($element).first();
      return this._findFirstForward($element, this.isReadable);
    },

    /**
     * Find all tabbable elements in the specified element.
     *
     * @param {Object|string|Array} $element
     * @returns {Object}
     */
    findTabbable: function($element) {
      var config = Adapt.a11y.config;
      return $($element).find(config._options._tabbableElements).filter(config._options._tabbableElementsExcludes);
    },

    /**
     * Find all readable elements in the specified element.
     *
     * @param {Object|string|Array} $element
     */
    findReadable: function($element) {
      var config = Adapt.a11y.config;
      return $($element).find('*').filter(function(index, element) {
        return this.isReadable(element);
      }.bind(this));
    },

    /**
     * Check if the element is natively or explicitly tabbable.
     *
     * @param {Object|string|Array} $element
     * @returns {boolean|undefined}
     */
    isTabbable: function($element) {
      var config = Adapt.a11y.config;
      var value = $($element).is(config._options._tabbableElements).is(config._options._tabbableElementsExcludes);
      if (!value) {
        return undefined; // Allow _findForward to descend
      }
      return value;
    },

    /**
     * Check if the first item is readable by a screen reader.
     *
     * @param {Object|string|Array} $element
     * @param {boolean} [checkParents=true] Check if parents are inaccessible.
     * @returns {boolean}
     */
    isReadable: function($element, checkParents) {
      var config = Adapt.a11y.config;
      $element = $($element).first();
      checkParents = checkParents === undefined ? true : false;

      var $branch =  checkParents
        ? $element.add($element.parents())
        : $element;

      var isNotVisible = _.find($branch.toArray(), function(item) {
        var $item = $(item);
        // make sure item is not explicitly invisible
        var isNotVisible = $item.css('display') === 'none'
          || $item.css('visibility') === 'hidden'
          || $item.attr('aria-hidden') === 'true';
        if (isNotVisible) {
          return true;
        }
      });
      if (isNotVisible) {
        return false;
      }

      // check that the component is natively tabbable or
      // will be knowingly read by a screen reader
      var hasNativeFocusOrIsScreenReadable = $element.is(config._options._focusableElements)
        || $element.is(config._options._readableElements);
      if (hasNativeFocusOrIsScreenReadable) {
        return true;
      }
      var childNodes = $element[0].childNodes;
      for (var c = 0, cl = childNodes.length; c < cl; c++) {
        var childNode = childNodes[c];
        var isTextNode = (childNode.nodeType === 3);
        if (!isTextNode) {
          continue;
        }
        var isOnlyWhiteSpace = /^\s*$/.test(childNode.nodeValue);
        if (isOnlyWhiteSpace) {
          continue;
        }
        return true;
      }
      return undefined; // Allows _findForward to decend.
    },

    /**
     * Find forward in the DOM, descending and ascending to move forward
     * as appropriate.
     *
     * If the selector is a function it should returns true, false or undefined.
     * Returning true matches the item and returns it. Returning false means do
     * not match or descend into this item, returning undefined means do not match,
     * but descend into this item.
     *
     * @param {Object|string|Array} $element
     * @param {string|function|undefined} selector
     * @returns {Object} Returns found descendant.
     */
    _findFirstForward: function($element, selector) {
      $element = $($element).first();

      // make sure iterator is correct, use boolean or selector comparison
      // appropriately
      var iterator;
      switch (typeof selector) {
        case 'string':
          // make selector iterator
          iterator = function($tag) {
            return $tag.is(selector) || undefined;
          };
          break;
        case 'function':
          iterator = selector;
          break;
        case 'undefined':
          // find first next element
          iterator = Boolean;
      }

      if ($element.length === 0) {
        return $element.not('*');
      }

      // check children by walking the tree
      var $found = this._findFirstForwardDescendant($element, iterator);
      if ($found && $found.length) {
        return $found;
      }

      // check subsequent siblings
      var $nextSiblings = $element.nextAll().toArray();
      _.find($nextSiblings, function(sibling) {
        var $sibling = $(sibling);
        var value = iterator($sibling);

        // skip this sibling if explicitly instructed
        if (value === false) {
          return;
        }

        if (value) {
          // sibling matched
          $found = $sibling;
          return true;
        }

        // check parent sibling children by walking the tree
        $found = this._findFirstForwardDescendant($sibling, iterator);
        if ($found && $found.length) return true;
      }.bind(this));
      if ($found && $found.length) {
        return $found;
      }

      // move through parents towards the body element
      var $branch = $element.add($element.parents()).toArray().reverse();
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
          if (value === false) {
            return;
          }

          if (value) {
            // sibling matched
            $found = $sibling;
            return true;
          }

          // check parent sibling children by walking the tree
          $found = this._findFirstForwardDescendant($sibling, iterator);
          if ($found && $found.length) {
            return true;
          }
        }.bind(this));
      }.bind(this));

      if (!$found || !$found.length) {
        return $element.not('*');
      }
      return $found;
    },

    /**
     * Find descendant in a DOM tree, work from selected to branch-end, through allowed
     * branch structures in hierarchy order
     *
     * If the selector is a function it should returns true, false or undefined.
     * Returning true matches the item and returns it. Returning false means do
     * not match or descend into this item, returning undefined means do not match,
     * but descend into this item.
     *
     * @param {Object|string|Array} $element jQuery element to start from.
     * @param {string|function|undefined} selector
     * @returns {Object} Returns found descendant.
     */
    _findFirstForwardDescendant: function($element, selector) {
      $element = $($element).first();

      // make sure iterator is correct, use boolean or selector comparison
      // appropriately
      var iterator;
      switch (typeof selector) {
        case 'string':
          // make selector iterator
          iterator = function($tag) {
            return $tag.is(selector) || undefined;
          };
          break;
        case 'function':
          iterator = selector;
          break;
        case 'undefined':
          // find first next element
          iterator = Boolean;
      }


      var $notFound = $element.not('*');
      if ($element.length === 0) {
        return $notFound;
      }

      // keep walked+passed children in a stack
      var stack = [{
        item: $element[0],
        value: undefined
      }];
      var stackIndexPosition = 0;
      var childIndexPosition = stackIndexPosition+1;
      do {

        var stackEntry = stack[stackIndexPosition];
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
          if (value === false) {
            return false;
          }

          // item passed or readable, add to stack before any parent
          // siblings
          stack.splice(childIndexPosition++, 0, {
            item: item,
            value: value
          });
        });

        // move to next stack item
        stackIndexPosition++;
        // keep place to inject children
        childIndexPosition = stackIndexPosition+1;
      } while (stackIndexPosition < stack.length)

      return $notFound;
    },

    /**
     * Assign focus to the next readable element.
     *
     * @param {Object|string|Array} $element
     * @param {FocusOptions} options
     * @returns {Object} Returns `Adapt.a11y`
     */
    focusNext: function($element, options) {
      options = new FocusOptions(options);
      $element = $($element).first();
      $element = Adapt.a11y.findFirstReadable($element);
      this.focus($element, options);
      return this;
    },

    /**
     * Assign focus to either the specified element if it is readable or the
     * next readable element.
     *
     * @param {Object|string|Array} $element
     * @param {FocusOptions} options
     * @returns {Object} Returns `Adapt.a11y`
     */
    focusFirst: function($element, options) {
      options = new FocusOptions(options);
      $element = $($element).first();
      if (Adapt.a11y.isReadable($element)) {
        this.focus($element, options);
        return $element;
      }
      $element = Adapt.a11y.findFirstReadable($element);
      this.focus($element, options);
      return $element;
    },

    /**
     * Force focus to the specified element with/without a defer or scroll.
     *
     * @param {Object|string|Array} $element
     * @param {FocusOptions} options
     * @returns {Object} Returns `Adapt.a11y`
     */
    focus: function($element, options) {
      options = new FocusOptions(options);
      $element = $($element).first();
      var config = Adapt.a11y.config;
      if (!config._isEnabled || !config._options._isFocusAssignmentEnabled || $element.length === 0) {
        return this;
      }
      function perform() {
        if (options.preventScroll) {
          var y = $(window).scrollTop();
          try {
            if ($element.attr('tabindex') === undefined) {
              $element.attr({
                'tabindex': '-1',
                'data-a11y-force-focus': 'true'
              });
            }
            $element[0].focus({
              preventScroll: true
            });
          } catch (e) {
            // Drop focus errors as only happens when the element
            // isn't attached to the DOM.
          }
          window.scrollTo(null, y);
        } else {
          $element[0].focus();
        }
      }
      if (options.defer) {
        _.defer(function() {
          perform();
        }.bind(this));
      } else {
        perform();
      }
      return this;
    },

    /**
     * Used to convert html to text aria-labels.
     *
     * @param {string} htmls Any html strings.
     * @returns {string} Returns text without markup or html encoded characters.
     */
    normalize: function(htmls) {
      var values = Array.prototype.slice.call(arguments, 0,-1);
      values = values.filter(Boolean);
      htmls = values.join(' ');
      var text = $('<div>' + htmls + '</div>').html();
      // Remove all html encoded characters, such as &apos;
      return text.replace(this._htmlCharRegex, '');
    },

    /**
     * Removes all html tags except stylistic elements.
     * Useful for producing uninterrupted text for screen readers from
     * any html.
     *
     * @param  {string} htmls Any html strings.
     * @return {string} Returns html string without markup which would cause screen reader to pause.
     */
    removeBreaks: function(htmls) {
      var values = Array.prototype.slice.call(arguments, 0,-1);
      values = values.filter(Boolean);
      htmls = values.join(' ');
      var $div = $('<div>' + htmls + '</div>');
      var stack = [ $div[0] ];
      var stackIndex = 0;
      var outputs = [];
      do {
        if (stack[stackIndex].childNodes.length) {
          var nodes = stack[stackIndex].childNodes;
          var usable = _.filter(nodes, function(node) {
            var isTextNode = (node.nodeType === 3);
            if (isTextNode) {
              return true;
            }
            var isStyleElement = $(node).is(Adapt.a11y.config._options._wrapStyleElements);
            if (isStyleElement) {
              return true;
            }
            return false;
          });
          outputs.push.apply(outputs, usable);
          stack.push.apply(stack, nodes);
        }
        stackIndex++;
      } while (stackIndex < stack.length)
      var rtnText = '';
      outputs.forEach(function(item) {
        rtnText+=item.outerHTML||item.textContent;
      });
      return rtnText;
    },

    /**
     * @param {Object|string|Array} $elements
     * @returns {Object} Returns `Adapt.a11y`
     */
    scrollEnable: function($elements) {
      this._scroll.enable($elements);
      return this;
    },

    /**
     * @param {Object|string|Array} $elements
     * @returns {Object} Returns `Adapt.a11y`
     */
    scrollDisable: function($elements) {
      this._scroll.disable($elements);
      return this;
    },

    /**
     * To apply accessibilty handling to a tag, isolating the user.
     *
     * @param {Object} $popupElement Element encapsulating the popup.
     * @returns {Object} Returns `Adapt.a11y`
     */
    popupOpened: function($popupElement) {
      this._popup.opened($popupElement);
      return this;
    },

    /**
     * Remove the isolation applied with a call to `popupOpened`.
     *
     * @param {Object} [$focusElement] Element to move focus to.
     * @returns {Object} Returns `Adapt.a11y`
     */
    popupClosed: function($focusElement) {
      this._popup.closed($focusElement);
      return this;
    }

  });

  return Adapt.a11y = new A11y();

});
