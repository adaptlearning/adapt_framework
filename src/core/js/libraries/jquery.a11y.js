//https://github.com/adaptlearning/jquery.a11y 2015-08-13

(function($, window) {

    var iOS = /iPad|iPhone|iPod/.test(navigator.platform);

    // JQUERY FILTERS FOR ELEMENTS
        var domFilters = {
            "globalTabIndexElementFilter": ':not(.a11y-ignore)',
            "focusableElementsFilter": ":visible:not(.disabled):not([tabindex='-1']):not(:disabled):not(.a11y-ignore-focus)",
            "ariaLabelElementsFilter": ":not( .a11y-ignore-aria [aria-label] )",
            "ariaHiddenParentsFilter": ":not(#wrapper):not(body)",
        };

    // JQUERY SELECTORS
        var domSelectors = {
            "focuser": "#a11y-focuser",
            "focusguard": "#a11y-focusguard",
            "selected": "#a11y-selected",
            "ignoreFocusElements": ".a11y-ignore-focus",
            "nativeSpaceElements": "textarea, input[type='text'], div[contenteditable=true]",
            "nativeEnterElements": "textarea, a, button, input[type='checkbox'], input[type='radio']",
            "nativeTabElements": "textarea, input, select",
            "wrapIgnoreElements": "a,button,input,select,textarea,br",
            "wrapStyleElements": "b,i,abbr,strong,em,small,sub,sup,ins,del,mark",
            "globalTabIndexElements": 'a,button,input,select,textarea,[tabindex]',
            "focusableElements": "a,button,input,select,textarea,[tabindex],label",
            "focusableElementsAccessible": ":not(a,button,input,select,textarea)[tabindex]",
            "hideableElements": ".a11y-hideable",
            "ariaLabelElements": "div[aria-label], span[aria-label]"
        };

    // JQUERY INJECTED ELEMENTS
        var domInjectElements = {
            "focuser": '<a id="a11y-focuser" href="#" class="prevent-default a11y-ignore" tabindex="-1" role="presentation" aria-label=".">&nbsp;</a>',
            "focusguard": '<a id="a11y-focusguard" class="a11y-ignore a11y-ignore-focus" tabindex="0" role="button">&nbsp;</a>',
            "selected": '<a id="a11y-selected" href="#" class="prevent-default a11y-ignore" tabindex="-1">&nbsp;</a>',
            "arialabel": "<span class='aria-label prevent-default' tabindex='0' role='region'></span>"
        };

    // Find functions backported from v5
        var FocusOptions = function(options) {
            _.defaults(this, options, {

                /**
                 * Stops the browser from scrolling to the focused point.
                 * https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus
                 *
                 * @type {boolean}
                 */
                preventScroll: true,

                /**
                 * Add a defer to the focus call, allowing for user interface settling.
                 *
                 * @type {boolean}
                 */
                defer: false

            });
        };

        var fromV5 = {

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
             * Find all readable elements in the specified element.
             *
             * @param {Object|string|Array} $element
             */
            findReadable: function($element) {
                return $($element).find('*').filter(_.bind(function(index, element) {
                    return this.isReadable(element);
                }, this));
            },

            /**
             * Check if the first item is readable by a screen reader.
             *
             * @param {Object|string|Array} $element
             * @param {boolean} [checkParents=true] Check if parents are inaccessible.
             * @returns {boolean}
             */
            isReadable: function($element, checkParents) {
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
                var hasNativeFocusOrIsScreenReadable = $element.is(domSelectors.focusableElements);
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
                _.find($nextSiblings, _.bind(function(sibling) {
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
                }, this));
                if ($found && $found.length) {
                    return $found;
                }

                // move through parents towards the body element
                var $branch = $element.add($element.parents()).toArray().reverse();
                _.find($branch, _.bind(function(parent) {
                    var $parent = $(parent);
                    if (iterator($parent) === false) {
                        // skip this parent if explicitly instructed
                        return false;
                    }

                    // move through parents nextAll siblings
                    var $siblings = $parent.nextAll().toArray();
                    return _.find($siblings, _.bind(function(sibling) {
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
                    }, this));
                }, this));

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
             * @returns {Object} Returns `fromV5`
             */
            focusNext: function($element, options) {
                options = new FocusOptions(options);
                $element = $($element).first();
                $element = fromV5.findFirstReadable($element);
                this.focus($element, options);
                return this;
            },

            /**
             * Assign focus to either the specified element if it is readable or the
             * next readable element.
             *
             * @param {Object|string|Array} $element
             * @param {FocusOptions} options
             * @returns {Object} Returns `fromV5`
             */
            focusFirst: function($element, options) {
                options = new FocusOptions(options);
                $element = $($element).first();
                if (fromV5.isReadable($element)) {
                    this.focus($element, options);
                    return $element;
                }
                $element = fromV5.findFirstReadable($element);
                this.focus($element, options);
                return $element;
            },

            /**
             * Force focus to the specified element with/without a defer or scroll.
             *
             * @param {Object|string|Array} $element
             * @param {FocusOptions} options
             * @returns {Object} Returns `fromV5`
             */
            focus: function($element, options) {
                options = new FocusOptions(options);
                $element = $($element).first();
                function perform() {
                    if (options.preventScroll) {
                        $.a11y.state.isFocusPreventScroll = true;
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
                        $.a11y.state.isFocusPreventScroll = false;
                    } else {
                        $element[0].focus();
                    }
                }
                if (options.defer) {
                    _.defer(_.bind(function() {
                        perform();
                    }, this));
                } else {
                    perform();
                }
                return this;
            },

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

        //PERFORMS CALCULATIONS TO TURN HTML/TEXT STRINGS INTO TABBABLE CONTENT
        function makeHTMLOrTextAccessible(text) {

            return getInnerHTML( makeChildNodesAccessible( wrapInDivAndMakeIntoDOMNode(text) ) );

            function wrapInDivAndMakeIntoDOMNode(text) {
                var $element;
                try {
                    // CONVERT ELEMENT TO DOM NODE
                    $element = $("<div>"+text+"</div>");
                } catch (e) {
                    throw e;
                }
                return $element;
            }

            function getInnerHTML($element) {
                var rtn = "";
                for (var i = 0; i < $element[0].children.length; i++) {
                    rtn += $element[0].children[i].outerHTML;
                }
                return rtn;
            }

            function makeChildNodesAccessible($element) {
                //CAPTURE DOMNODE CHILDREN
                var children = $element.children();


                if (children.length === 0) {
                    //IF NO CHILDREN, ASSUME TEXT ONLY, WRAP IN SPAN TAG
                    var textContent = $element.text();
                    if (stringTrim(textContent) === "") return $element;
                    removeChildNodes($element);
                    $element.append( makeElementTabbable($("<span>"+textContent+"</span>")) );
                    return $element;
                }


                //IF ONLY STYLE TAGS WRAP IN SPAN
                var styleChildCount = 0;
                for (var c = 0; c < children.length; c++) {
                    if ($(children[c]).is(domSelectors.wrapStyleElements)) styleChildCount++;
                }
                if (styleChildCount === children.length) {
                    return $("<span>").append(makeElementTabbable($element));
                }

                //SEARCH FOR TEXT ONLY NODES AND MAKE TABBABLE
                var newChildren = [];
                var added = false;
                for (var i = 0; i < $element[0].childNodes.length; i++) {
                    var child = $element[0].childNodes[i];
                    var cloneChild = $(child.outerHTML)[0];
                    switch(child.nodeType) {
                    case 3: //TEXT NODE
                        // preserve whitespace in ie8 by adding initial zero-width space
                        var childContent = child.textContent || "&#8203;" + child.nodeValue;
                        //IF TEXT NODE WRAP IN A TABBABLE SPAn
                        newChildren.push( makeElementTabbable($("<span>"+childContent+"</span>")) );
                        added = true;
                        break;
                    case 1: //DOM NODE
                        var $child = $(cloneChild);
                        if (($child.is(domSelectors.wrapStyleElements) && !added) || $child.is(domSelectors.wrapIgnoreElements)) {
                            //IGNORE NATIVELY TABBABLE ELEMENTS AND STYLING ELEMENTS
                            newChildren.push( $child );
                        } else {
                            var childChildren = $child.children();
                            if (childChildren.length === 0) {
                                //DO NOT DESCEND INTO TEXT ONLY NODES
                                var textContent = $child.text();
                                if (stringTrim(textContent) !== "") makeElementTabbable($child);
                            } else {
                                //DESCEND INTO NODES WITH CHILDREN
                                makeChildNodesAccessible($child);
                            }
                            newChildren.push( $child );
                        }
                        break;
                    }
                }

                removeChildNodes($element);
                $element.append(newChildren);

                return $element;

                function removeChildNodes($element) {
                    var childNodes = $element[0].childNodes.length;
                    for (var i = childNodes - 1; i > -1 ; i--) {
                        if ($element[0].childNodes[i].remove) $element[0].childNodes[i].remove();
                        else if ($element[0].removeChild) $element[0].removeChild($element[0].childNodes[i]); //safari fix
                        else if ($element[0].childNodes[i].removeNode) $element[0].childNodes[i].removeNode(true); //ie 11 fix
                    }
                    return $element;
                }

                //MAKES AN ELEMENT TABBABLE
                function makeElementTabbable($element) {
                    $element.attr({
                        "role": "region",
                        "tabindex": 0,
                    }).addClass("prevent-default").addClass("accessible-text-block");
                    return $element;
                }
            }
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
            var options = $.a11y.options;

            if (!options.isFocusLimited) return this;
            if ($.a11y.state.isFocusPreventScroll) return this;

            if (this.length === 0) return this;

            var $element = $(this[0]);

            if ($element.isFixedPostion()) return this;

            options = options || {};

            var topOffset = options.focusOffsetTop || 0;
            var bottomOffset = options.focusOffsetTop || 0;

            var elementTop = $element.offset()["top"];
            var scrollTopWithTopOffset = $(window).scrollTop() + topOffset;

            var windowAvailableHeight = $(window).innerHeight() - bottomOffset - topOffset;

            var scrollBottomWithTopOffset = scrollTopWithTopOffset + windowAvailableHeight

            var scrollToPosition = elementTop - topOffset - (windowAvailableHeight / 2);
            if (scrollToPosition < 0) scrollToPosition = 0;

            if (options.isDebug) console.log("limitedScrollTo", scrollToPosition);

            defer(function() {
                $.scrollTo(this.scrollToPosition, { duration: 0 });
            }, {scrollToPosition:scrollToPosition});

            return this;
        };

        //jQuery function to focus with no scroll (accessibility requirement for control focus)
        $.fn.focusNoScroll = function() {
            if (this.length === 0) return this;
            fromV5.focus(this, {defer: true})
            return this;
        };

        $.fn.focusOrNext = function(returnOnly) {
            if (this.length === 0) return this;
            var $element = $(this[0]);
            if (returnOnly) {
                return fromV5.findFirstReadable($element);
            }
            return fromV5.focusFirst($element);
        };


    // PRIVATE EVENT HANDLERS
        function onKeyUp(event) {
            var options = $.a11y.options;

            var $element = $(event.target);

            switch (event.which) {
            case 32: //SPACE

                //IF ELEMENT HANDLES SPACE THEN SKIP
                if ($element.is(domSelectors.nativeSpaceElements)) return;

                //STOP SPACE FROM SCROLLING / SELECTING
                preventDefault(event);

                if (options.isDebug) console.log("a11y: space keyup > click");

                //TURN SPACE INTO CLICK
                $element.trigger("click");

                break;
            case 27: //ESCAPE

                if (options.isDebug) console.log("a11y: escape keyup > focus on first element");
                //FOCUS ON FIRST ELEMENT
                $.a11y_focus();
                break;
            }
        }

        function onKeyDown(event) {
            var options = $.a11y.options;

            var $element = $(event.target);

            switch (event.which) {
            case 32: //SPACE
                //IF ELEMENT HANDLES SPACE SKIP
                if ($element.is(domSelectors.nativeSpaceElements)) return;

                //STOP SPACE FROM SCROLLING / SELECTING
                preventDefault(event);

                if (options.isDebug) console.log("a11y: space keydown > blocked default");

                break;
            case 13: //ENTER

                //IF ELEMENT HANDLES ENTER THEN SKIP
                if ($element.is(domSelectors.nativeEnterElements)) return;

                //STOP ENTER FROM SCROLLING / SELECTING
                preventDefault(event);

                if (options.isDebug) console.log("a11y: enter keydown > click");

                //TURN ENTER INTO CLICK
                $element.trigger("click");
            }
        }

        function onFocusCapture(event) {
            var options = $.a11y.options;
            var state = $.a11y.state;
            var $element = $(event.target);

            //search out intended click element
            if (!$element.is(domSelectors.globalTabIndexElements)) {
                //if element receiving click is not tabbable, search parents
                var $parents = $element.parents();
                var $tabbableParents = $parents.filter(domSelectors.globalTabIndexElements);
                if ($tabbableParents.length === 0) {
                    //if no tabbable parents, search for proxy elements
                    var $proxyElements = $parents.filter("[for]");

                    //if no proxy elements, ignore
                    if ($proxyElements.length === 0) {
                        //find next focusable element if no proxy element found
                        $element = $element.focusOrNext(true);
                    } else {
                        //isolate proxy element by id
                        var $proxyElement = $("#"+$proxyElements.attr("for"));
                        if (!$proxyElement.is(domSelectors.globalTabIndexElements)) {
                            //find next focusable element if no tabbable element found
                            $element = $element.focusOrNext(true);
                        } else {
                            //use tabbable proxy
                            $element = $proxyElement;
                        }
                    }
                } else {

                    //use tabbable parent
                    $element = $($tabbableParents[0]);
                }
            }

            state.$activeElement = $element;
            if (options.isDebug) console.log("focusCapture", $element[0]);
        }

        function onFocus(event) {
            var options = $.a11y.options;
            var state = $.a11y.state;

            var $element = $(event.target);

            if (!$element.is(domSelectors.globalTabIndexElements)) return;
            a11y_triggerReadEvent($element);

            if (options.isDebug) console.log("focus", $element[0]);

            state.$activeElement = $(event.currentTarget);

            if (state.$activeElement.is(domSelectors.nativeTabElements)) {
                //Capture that the user has interacted with a native form element
                $.a11y.userInteracted = true;
            }

            var options = $.a11y.options;

            $element.limitedScrollTo();
        }

        function onBlur(event) {
            var $element = $(event.target);

            if ($element.is('[data-a11y-force-focus]')) {
                $element.removeAttr("tabindex data-a11y-force-focus");
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
            window.addEventListener("wheel", nativePreventScroll, { passive: false });
            window.addEventListener("mousewheel", nativePreventScroll, { passive: false });
            document.addEventListener("wheel", nativePreventScroll, { passive: false });
            document.addEventListener("mousewheel", nativePreventScroll, { passive: false });
            $(window).on("touchstart", onScrollStartCapture); // mobile
            window.addEventListener("touchmove", nativePreventScroll, { passive: false }); // mobile
            $(window).on("touchend", onScrollEndCapture); // mobile
            $(document).on("keydown", preventScrollKeys);
        }

        function a11y_removeScrollListeners() {
            window.removeEventListener("wheel", nativePreventScroll);
            window.removeEventListener("mousewheel", nativePreventScroll);
            document.removeEventListener("wheel", nativePreventScroll);
            document.removeEventListener("mousewheel", nativePreventScroll);
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

        function a11y_reattachFocusGuard() {
            var options = $.a11y.options;
            var $focusguard = $(domSelectors.focusguard);

            if ($focusguard.length === 0) {
                $focusguard = $(domInjectElements.focusguard);
            }

            var $currentFloor = $.a11y.state.floorStack[$.a11y.state.floorStack.length-1];

            $focusguard.remove().appendTo($currentFloor).attr("tabindex", 0);

            $focusguard.off("click").off("focus");

            $focusguard.on("click", function(event) {

                if (options.isDebug) console.log ("focusguard");

                preventDefault(event)
                $.a11y_focus(true);

            });

            $focusguard.on("focus", function(event) {

                if (options.isDebug) console.log ("focusguard");

                preventDefault(event);
                $.a11y_focus(true);

                return false;

            });
        }

        function a11y_setupUserInputControlListeners() {
             $('body')
                .off("click", ".prevent-default", preventDefault)
                .off("keyup", onKeyUp)
                .off("keydown", onKeyDown);

            $('body')
                .on("click", ".prevent-default", preventDefault)
                .on("keyup", onKeyUp)
                .on("keydown", onKeyDown);
        }

        function a11y_setupFocusControlListeners() {
            var options = $.a11y.options;
            $("body")
                .off("mousedown touchstart", domSelectors.focusableElements, onFocusCapture) //IPAD TOUCH-DOWN FOCUS FIX FOR BUTTONS
                .off("focus", domSelectors.globalTabIndexElements, onFocus)
                .off("blur", domSelectors.globalTabIndexElements, onBlur);

            $("body")
                .on("mousedown touchstart", domSelectors.focusableElements, onFocusCapture) //IPAD TOUCH-DOWN FOCUS FIX FOR BUTTONS
                .on("focus", domSelectors.globalTabIndexElements, onFocus)
                .on("blur", domSelectors.globalTabIndexElements, onBlur);
        }

        function a11y_injectControlElements() {
            if ($(domSelectors.selected).length === 0) $('body').append($(domInjectElements.selected))
            if ($(domSelectors.focuser).length === 0)$('body').append($(domInjectElements.focuser))
        }

        function a11y_removeNotAccessibles() {
            //STOP ELEMENTS WITH .not-accessible CLASS FROM BEING IN TAB INDEX
            $(".not-accessible[tabindex='0'], .not-accessible [tabindex='0']").attr({
                "tabindex": "-1",
                "aria-hidden": true
            }).addClass("aria-hidden");
        }

        function a11y_disabledAccessibleTabElements() {
            var accessibleTabElements = $(domSelectors.focusableElementsAccessible);
            accessibleTabElements.attr({
                "aria-hidden": "true",
                "tabindex": "-1"
            });
        }

        function a11y_debug() {

            if ($.a11y.state.isDebugApplied) return;

            $.a11y.state.isDebugApplied = true;

            $("body").on("focus blur click change", "*", function(event) {
                console.log("a11y_debug", event.type, event.currentTarget);
            });
        }
        //TURN ON ACCESSIBILITY FEATURES
        $.a11y = function(isOn, options) {
            if ($.a11y.options.isDebug) console.log("$.a11y called", isOn, options )
            return this;
        };

        $.a11y.options = {
            focusOffsetTop: 0,
            focusOffsetBottom: 0,
            animateDuration: 250,
            OS: "",
            isTouchDevice: false,
            isTabbableTextEnabled: false,
            isUserInputControlEnabled: true,
            isFocusControlEnabled: true,
            isFocusLimited: false,
            isRemoveNotAccessiblesEnabled: true,
            isAriaLabelFixEnabled: true,
            isFocusWrapEnabled: true,
            isScrollDisableEnabled: true,
            isScrollDisabledOnPopupEnabled: false,
            isSelectedAlertsEnabled: false,
            isAlertsEnabled: false,
            isDebug: false
        };
        $.a11y.state = {
            $activeElement: null,
            floorStack: [$("body")],
            focusStack: [],
            tabIndexes: {},
            elementUIDIndex: 0,
            scrollDisabledElements: null,
            scrollStartEvent: null
        };

        $.a11y.ready = function() {
            var options = $.a11y.options;

            if (iOS) options.OS = "mac";

            a11y_injectControlElements();

            if (options.isUserInputControlEnabled) {
                a11y_setupUserInputControlListeners();
            }

            if (options.isFocusControlEnabled) {
                a11y_setupFocusControlListeners();
            }

            if (options.isFocusWrapEnabled) {
                a11y_reattachFocusGuard();
            }

            if (options.isDebug) {
                console.log("a11y_ready");
                a11y_debug();
            }

        };

        //REAPPLY ON SIGNIFICANT VIEW CHANGES
        $.a11y_update = function() {
            var options = $.a11y.options;

            if (iOS) options.OS = "mac";

            if (options.isRemoveNotAccessiblesEnabled) {
                a11y_removeNotAccessibles();
            }

            if (options.isAriaLabelFixEnabled) {
                $('body').a11y_aria_label(true);
            }

            if (options.isFocusWrapEnabled) {
                a11y_reattachFocusGuard();
            }

            if (!options.isTabbableTextEnabled) {
                a11y_disabledAccessibleTabElements();
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
                $(domSelectors.focuser).focusNoScroll();
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
                    if (options.isTabbableTextEnabled || !$item.is(domSelectors.focusableElementsAccessible)) {
                        $item.removeAttr("aria-hidden").removeClass("aria-hidden");
                        $item.parents(domFilters.parentsFilter).removeAttr("aria-hidden").removeClass("aria-hidden");
                    }
                    if (withDisabled) {
                        $item.removeAttr("disabled").removeClass("disabled");
                    }
                } else if (enabled) {
                    if (options.isTabbableTextEnabled || !$item.is(domSelectors.focusableElementsAccessible)) {
                        $item.attr({
                            tabindex: "0",
                        }).removeAttr("aria-hidden").removeClass("aria-hidden");
                        $item.parents(domFilters.parentsFilter).removeAttr("aria-hidden").removeClass("aria-hidden");
                    }
                    if (withDisabled) {
                        $item.removeAttr("disabled").removeClass("disabled");
                    }
                } else {
                    if (options.isTabbableTextEnabled || !$item.is(domSelectors.focusableElementsAccessible)) {
                        $item.attr({
                            tabindex: "-1",
                            "aria-hidden": "true"
                        }).addClass("aria-hidden");
                    }
                    if (withDisabled) {
                        $item.attr("disabled","disabled").addClass("disabled");
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

            if (!options.isTabbableTextEnabled) return text;
            //USED SPECIFICALLY FOR CONVERTING TITLE TEXT TO ARIA-LABELS
            var text = $("<div>" + text + "</div>").text();
            //REMOVE HTML CHARACTERS SUCH AS &apos;
            text = text.replace(htmlCharRegex,"");
            return text;
        }

        //CONVERTS HTML OR TEXT STRING TO ACCESSIBLE HTML STRING
        $.a11y_text = function (text) {
            var options = $.a11y.options;

            if (!options.isTabbableTextEnabled) return text;

            return makeHTMLOrTextAccessible(text)
        };

        //CONVERTS DOM NODE TEXT TO ACCESSIBLE DOM NODES
        $.fn.a11y_text = function(text) {
            var options = $.a11y.options;

            if (!options.isTabbableTextEnabled) {
                if (text) {
                    this.html(text);
                }

                return this;
            }

            for (var i = 0; i < this.length; i++) {
                // If an argument is given then convert that to accessible text
                // Otherwise convert existing content
                text = text || this[i].innerHTML;
                this[i].innerHTML = makeHTMLOrTextAccessible(text);
            }
            return this;
        };



    //MAKE SELECTED

        $.fn.a11y_selected = function(isOn, noFocus) {
            if (this.length === 0) return this;

            var options = $.a11y.options;
            if (!options.isSelectedAlertsEnabled) return this;

            if (isOn === undefined) isOn = true;
            if (isOn) {
                var selected = $(this[0]);
                switch ($.a11y.options.OS) {
                case "mac":
                    //ANNOUNCES SELECTION ON A MAC BY ADDING A SPAN AND SHIFTING FOCUS
                    if (noFocus !== true) $("#a11y-selected").focusNoScroll();
                    _.delay(function() {
                        selected.prepend($("<span class='a11y-selected aria-label'>selected </span>"))
                        if (noFocus !== true) $(selected).focusNoScroll();
                    },250);
                    break;
                default:
                    //ANOUNCES THE SELECTION ON TABLETS AND PCS
                    if (noFocus !== true) $.a11y_alert("selected " + selected.text());
                    selected.attr( "aria-label", "selected " + selected.text()).addClass("a11y-selected");
                    break;
                }
            } else {
                switch ($.a11y.options.OS) {
                case "mac":
                    for (var i = 0; i < this.length; i++) {
                        $(this[i]).find(".a11y-selected").remove()
                    }
                    break;
                default:
                    for (var i = 0; i < this.length; i++) {
                        if ($(this[i]).is(".a11y-selected")) $(this[i]).removeClass("a11y-selected").removeAttr("aria-label");
                        $(this[i]).find(".a11y-selected").removeClass("a11y-selected").removeAttr("aria-label");
                    }
                }
            }
            return this;
        };

        $.a11y_alert = function(text) {
            if (this.length === 0) return this;

            var options = $.a11y.options;
            if (!options.isAlertsEnabled) return this;

            var $alert = $('<div role="alert">'+text+'</div>');

            $($.a11y).trigger("reading", text);
            switch(options.OS) {
            case "mac":
                $("#a11y-selected").append($alert);
                break;
            default:
            $alert.css("visibility","hidden");
                $("#a11y-selected").append($alert);
            $alert.css("visibility","visible");
            }

            setTimeout(function() {
                $alert.remove();
            }, 20000);

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

            $elements.each(function(index, item) {
                var $item = $(item);

                var elementUID;
                if (item.a11y_uid == undefined) {
                    item.a11y_uid = "UID" + ++state.elementUIDIndex;
                }
                elementUID = item.a11y_uid;

                if (storeLastTabIndex) {
                    if (state.tabIndexes[elementUID] === undefined) state.tabIndexes[elementUID] = [];
                    state.tabIndexes[elementUID].push( $item.attr('tabindex') || 0 );
                }

                $item.attr({
                    'tabindex': -1,
                    'aria-hidden': true
                }).addClass("aria-hidden");
            });

            $hideable.attr("aria-hidden", true).attr("tabindex", "-1").addClass("aria-hidden");

            this.find(domSelectors.globalTabIndexElements).filter(domFilters.globalTabIndexElementFilter).attr({
                'tabindex': 0
            }).removeAttr('aria-hidden').removeClass("aria-hidden").parents(domFilters.parentsFilter).removeAttr('aria-hidden').removeClass("aria-hidden");
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

            if (this.length > 0) $(this[0]).limitedScrollTo();

            if (options.isScrollDisabledOnPopupEnabled) {
                $('body').scrollDisable();
                $(domSelectors.focusguard).css({
                    "position":"fixed",
                    "bottom": "0px"
                });
            }

            return this;

        };

        //RESTORES FOCUS TO PREVIOUS STATE AFTER a11y_popup
        $.a11y_popdown = function() {
            var options = $.a11y.options;
            var state = $.a11y.state;

            $.a11y.state.floorStack.pop();

            $(domSelectors.globalTabIndexElements).filter(domFilters.globalTabIndexElementFilter).each(function(index, item) {
                var $item = $(item);
                var previousTabIndex = 0;

                var elementUID;
                if (item.a11y_uid == undefined) {
                    //assign element a unique id
                    item.a11y_uid = "UID" + ++state.elementUIDIndex;
                }
                elementUID = item.a11y_uid;


                if (state.tabIndexes[elementUID] !== undefined && state.tabIndexes[elementUID].length !== 0) {
                    //get previous tabindex if saved
                    previousTabIndex = parseInt(state.tabIndexes[elementUID].pop());
                }
                if (state.tabIndexes[elementUID] !== undefined && state.tabIndexes[elementUID].length > 0) {
                    //delete element tabindex store if empty
                    delete state.tabIndexes[elementUID];
                }

                $item.attr({
                    'tabindex': previousTabIndex
                });

                if (previousTabIndex === -1) {
                    //hide element from screen reader
                    return $item.attr('aria-hidden', true).addClass("aria-hidden");
                }

                //show element to screen reader
                $item.removeAttr('aria-hidden').removeClass("aria-hidden");

                if ($item.is(domSelectors.hideableElements)) {
                    $item.removeAttr("tabindex");
                }
            });

            var $activeElement = state.$activeElement = state.focusStack.pop();

            $.a11y_update();

            if (options.isScrollDisabledOnPopupEnabled) {
                $('body').scrollEnable();
                $(domSelectors.focusguard).css({
                    "position":"",
                    "bottom": ""
                });
            }

            defer(function() {

                if ($activeElement) {
                    state.$activeElement = $activeElement;
                    //scroll to focused element
                    state.$activeElement.focusOrNext().limitedScrollTo();
                } else {
                    $.a11y_focus();
                }

            }, this, 500);

            return this;
        };


    //SET FOCUS


        //FOCUSES ON FIRST TABBABLE ELEMENT
        $.a11y_focus = function(dontDefer) {
            fromV5.focusFirst('body', {
                defer: !dontDefer
            });
			return this;
        };

        //FOCUSES ON FIRST TABBABLE ELEMENT IN SELECTION
        $.fn.a11y_focus = function() {
            if (this.length === 0) return this;
            return fromV5.focusFirst(this, {
                defer: true
            });
        };


    //CONVERT ARIA LABELS
        //TURNS aria-label ATTRIBUTES INTO SPAN TAGS
        $.fn.a11y_aria_label = function(deep) {
            var options = $.a11y.options;

            if (!options.isAriaLabelFixEnabled) return this;

            var ariaLabels = [];

            for (var i = 0; i < this.length; i++) {
                var $item = $(this[i]);

                if ($item.not(domSelectors.ariaLabelElementsFilter).is(domSelectors.ariaLabelElements)) {
                    ariaLabels.push(this[i]);
                }

                if (deep === true) {
                    var children = $item.find(domSelectors.ariaLabelElements).filter(domFilters.ariaLabelElementsFilter);
                    ariaLabels = ariaLabels.concat(children.toArray());
                }

            }

            if (ariaLabels.length === 0) return this;

            for (var i = 0; i < ariaLabels.length; i++) {
                var $item = $(ariaLabels[i]);

                var $itemChildren = $item.children();
                if ($itemChildren.length === 0) continue;

                var firstChild = $itemChildren[0];
                var $firstChild = $(firstChild)

                if ($firstChild.is(".aria-label")) continue;

                var ariaLabel = $item.attr("aria-label");

                if (ariaLabel) {
                    var injectElement = $(domInjectElements.arialabel);
                    if (!options.isTabbableTextEnabled) {
                        injectElement.attr({
                            "tabindex": "-1"
                        }).addClass("a11y-ignore");
                    }
                    injectElement.html( ariaLabel );
                    $item.prepend(injectElement);
                }

                $item.removeAttr("role").removeAttr("aria-label").removeAttr("tabindex").removeClass("aria-hidden");
            }

            return this;
        };




})(jQuery, window);
