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

            var isElementTopOutOfView = (elementTop < scrollTopWithTopOffset || elementTop > scrollBottomWithTopOffset);

            if (!isElementTopOutOfView) {
                if ($element.is("select, input[type='text'], textarea") && iOS) { //ios 9.0.4 bugfix for keyboard and picker input
                    defer(function(){
                        if (options.isDebug) console.log("limitedScrollTo select fix", this.scrollToPosition);
                        $.scrollTo(this.scrollToPosition, { duration: 0 });
                    }, {scrollToPosition:scrollToPosition}, 1000);
                }
                return;
            };

            if ($element.is("select, input[type='text'], textarea") && iOS) {  //ios 9.0.4 bugfix for keyboard and picker input
                defer(function(){
                    if (options.isDebug) console.log("limitedScrollTo select fix", this.scrollToPosition);
                    $.scrollTo(this.scrollToPosition, { duration: 0 });
                }, {scrollToPosition:scrollToPosition}, 1000);
            } else {
                if (options.isDebug) console.log("limitedScrollTo", scrollToPosition);
            defer(function() {
                    $.scrollTo(this.scrollToPosition, { duration: 0 });
                }, {scrollToPosition:scrollToPosition});
            }

            return this;
        };

        //jQuery function to focus with no scroll (accessibility requirement for control focus)
        $.fn.focusNoScroll = function() {
            if (this.length === 0) return this;

            defer(function() {
                var options = $.a11y.options;
                if (options.isDebug) console.log("focusNoScroll", this[0]);

                var y = $(window).scrollTop();
                try {
                this[0].focus();
                } catch(e){}
                window.scrollTo(null, y);
            }, this);
            return this; //chainability
        };

        $.fn.focusOrNext = function(returnOnly) {
            if (this.length === 0) return this;

            var $element = $(this[0]);

            var isSpecialElement = $element.is(domSelectors.focuser) || $element.is(domSelectors.focusguard) || $element.is(domSelectors.selected); 
            var isTabbable = $element.is(domSelectors.focusableElements) && $element.is(domFilters.focusableElementsFilter);

            if (!isSpecialElement && !isTabbable) {
                //if the element is not focusable, find the next focusable element in section
                //light processing
                var $nextElement = $element.nextAll(domSelectors.focusableElements);
                //filter enabled+visible
                var $nextElementFiltered = $nextElement.filter(domFilters.focusableElementsFilter);
                if ($nextElement.length === 0 || $nextElementFiltered.length === 0) {
                    //if next element isn't focusable find next element in document
                    //heavy processing
                    //fetch all parents subsequent siblings
                    var $parents = $element.parents();
                    var $nextSiblings = $parents.nextAll();
                    //filter siblings for focusable
                    var $nextAllElements = $nextSiblings.find(domSelectors.focusableElements);
                    //filter enabled+visible focusable items
                    var $nextAllElementsFiltered = $nextAllElements.filter(domFilters.focusableElementsFilter);
                    
                    //if none found go to focuser
                    if ($nextAllElementsFiltered.length === 0) {
                        $element = $(domSelectors.focuser);
                    } else {
                        //return first found element
                        $element = $($nextAllElementsFiltered[0]);
                    }

                } else {

                    //return first found element
                    $element = $($nextElementFiltered[0]);
                }
            }

            var options = $.a11y.options;
            if (options.isDebug) console.log("focusOrNext", $element[0]);
            
            if (returnOnly !== true) {
                if (options.OS != "mac") $(domSelectors.focuser).focusNoScroll();
                $element.focusNoScroll();
            }

            //return element focused
            return $element;

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


    // PRIVATE $.a11y FUNCTIONS
        function a11y_setupScrollListeners() {
            var scrollEventName = "wheel mousewheel";
            $(window).on(scrollEventName, preventScroll);
            $(document).on(scrollEventName, preventScroll);
            $(window).on("touchstart", onScrollStartCapture); // mobile
            $(window).on("touchmove", preventScroll); // mobile
            $(window).on("touchend", onScrollEndCapture); // mobile
            $(document).on("keydown", preventScrollKeys);
        }

        function a11y_removeScrollListeners() {
            var scrollEventName = "wheel mousewheel";
            $(window).off(scrollEventName, preventScroll);
            $(document).off(scrollEventName, preventScroll);
            $(window).off("touchstart", onScrollStartCapture); // mobile
            $(window).off("touchmove", preventScroll); // mobile
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
                .off("focus", domSelectors.globalTabIndexElements, onFocus);

            $("body")
                .on("mousedown touchstart", domSelectors.focusableElements, onFocusCapture) //IPAD TOUCH-DOWN FOCUS FIX FOR BUTTONS
                .on("focus", domSelectors.globalTabIndexElements, onFocus);
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

        function a11y_iosFalseClickFix() {  //ios 9.0.4 bugfix for invalid clicks on input overlays
            //with voiceover on, ios will allow clicks on :before and :after content text. this causes the first tabbable element to recieve focus
            //redirect focus back to last item in this instance
            var isPerformingRedirect = false;
            var options = $.a11y.options;

            $("body").on("click", "*", function(event) {
                if (isPerformingRedirect) return;

                onFocusCapture(event);

                var $active = $.a11y.state.$activeElement;
                if (!$active.is(domSelectors.globalTabIndexElements)) return;

                if (options.isDebug) console.log("a11y_iosFalseClickFix", $active[0]);

                isPerformingRedirect = true;

                defer(function() {
                    $active.focus();
                    isPerformingRedirect = false;
                }, 500);

            });
        }

        function a11y_iosFixes() {

            if ($.a11y.state.isIOSFixesApplied) return;

            $.a11y.state.isIOSFixesApplied = true;
            a11y_iosFalseClickFix();

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
            isIOSFixesEnabled: true,
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

            if (iOS && options.isIOSFixesEnabled) {
                a11y_iosFixes();
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
            //IF HAS ACCESSIBILITY, FOCUS ON FIRST VISIBLE TAB INDEX
            if (dontDefer) {
                var tags = $(domSelectors.focusableElements).filter(domFilters.focusableElementsFilter);
                if (tags.length > 0) {
                    $(tags[0]).focusOrNext();
                }
                return this;
            }

            defer(function(){
                var tags = $(domSelectors.focusableElements).filter(domFilters.focusableElementsFilter);
                if (tags.length > 0) {
                    $(tags[0]).focusOrNext();
                }
            });
            //SCROLL TO TOP IF NOT POPUPS ARE OPEN        
            return this;
        };

        //FOCUSES ON FIRST TABBABLE ELEMENT IN SELECTION
        $.fn.a11y_focus = function() {
            if (this.length === 0) return this;
            //IF HAS ACCESSIBILITY, FOCUS ON FIRST VISIBLE TAB INDEX
            defer(function(){
                var $this = $(this[0]);
                if ($this.is(domSelectors.focusableElements)) {
                    $this.focusOrNext();
                } else {
                    var tags = $this.find(domSelectors.focusableElements).filter(domFilters.focusableElementsFilter);
                    if (tags.length === 0) {
                        var $parents = $this.parents();
                        for (var i = 0, l = $parents.length; i < l; i++) {
                            var $parent = $($parents[i]);
                            tags = $parent.find(domSelectors.focusableElements).filter(domFilters.focusableElementsFilter);
                            if (tags.length > 0) {
                                return $(tags[0]).focusOrNext();
                            }
                        }
                    } else {
                        $(tags[0]).focusOrNext();
                    }
                    
                }
            }, this);
            return this;
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

