'use strict';
// jquery.onscreen 2018-01-22 https://github.com/adaptlearning/jquery.onscreen

(function() {

    //ENUMERATION SUPPORT
    function ENUM(e){for(var i=0,l=e.length;i<l;i++){var n=e[i].toLowerCase();this[n]=(new Number(i));this[n].string=n;}}

    //handler id generation
    var expando = {
        index: 0,

        check: function(element) {
            //check that the element has a valid jquery expando property, or make one

            var hasExpando = (element[$.expando]);
            if (hasExpando) return;

            element[$.expando] = ++expando.index;

        },

        make: function(element, data) {
            //make a unique event id from the element's expando property and the event handler guid

            expando.check(element);
            return data.guid + "-" + element[$.expando];

        }
    };

    //handler functions
    var handlers = {
        //types definition
        TYPE: new ENUM(["onscreen", "inview"]),
        INVIEW_STATES: new ENUM(["none", "top", "bottom", "left", "right", "both"]),

        registered: [],
        shouldReProcess: true,

        register: function(element, data, type) {
            var isLocked = locking.isLocked();

            var $element = $(element);
            handlers.registered.push({
                id: expando.make(element, data),
                data: data,
                $element: $element,
                type: type,
                _onscreen: isLocked ? null : measurements.get($element).uniqueMeasurementId,
                _hasTriggered: false
            });
            handlers.shouldReProcess = true;

        },

        unregister: function(element, data, type) {

            var registered = handlers.registered;

            var findId = expando.make(element, data);
            for (var i = registered.length-1, l = -1; i > l; i--) {
                var item = registered[i]
                if (item.id != findId || item.type != type) continue;
                registered.splice(i,1);
                handlers.shouldReProcess = true;
            }

        },

        process: function() {

            var registered = handlers.registered;
            var registeredCount;

            handlers.shouldReProcess = true;
            while (handlers.shouldReProcess) {
                handlers.shouldReProcess = false;

                registeredCount = registered.length;
                if  (registeredCount == 0) return;

                for (var i = 0; i < registeredCount; i++) {
                    var item = registered[i];
                    var measure = measurements.get(item.$element);

                    //check if measure has the same values as last
                    var wasPreviouslyMeasured = (item._onscreen !== undefined);

                    if (wasPreviouslyMeasured && item._hasTriggered) {
                        var hasMeasureChanged = (item._onscreen != measure.uniqueMeasurementId);
                        if (!hasMeasureChanged) {
                            continue;
                        }
                    }

                    item._onscreen = measure.uniqueMeasurementId;
                    item._hasTriggered = true;

                    switch (item.type) {
                    case handlers.TYPE.onscreen:
                        handlers.processOnScreen(item, measure);
                        break;
                    case handlers.TYPE.inview:
                        handlers.processInView(item, measure);
                    }
                    if (handlers.shouldReProcess) {
                        break;
                    }
                }
            }

        },

        processOnScreen: function(item, measure) {

            item.$element.trigger('onscreen', measure);

        },

        processInView: function(item, measure) {

            var isTopOnScreen = (measure.percentFromTop >= 0 && measure.percentFromTop <= 100);
            var isBottomOnScreen = (measure.percentFromBottom >= 0 && measure.percentFromBottom <= 100);
            var isLeftOnScreen = (measure.percentFromLeft >= 0 && measure.percentFromLeft <= 100);
            var isRightOnScreen = (measure.percentFromRight >= 0 && measure.percentFromRight <= 100);

            var visiblePartY;
            if (isTopOnScreen && isBottomOnScreen) visiblePartY = handlers.INVIEW_STATES.both.string;
            else if (isTopOnScreen) visiblePartY = handlers.INVIEW_STATES.top.string;
            else if (isBottomOnScreen) visiblePartY = handlers.INVIEW_STATES.bottom.string;
            else visiblePartY = handlers.INVIEW_STATES.none.string;

            var visiblePartX;
            if (isLeftOnScreen && isRightOnScreen) visiblePartX = handlers.INVIEW_STATES.both.string;
            else if (isLeftOnScreen) visiblePartX = handlers.INVIEW_STATES.left.string;
            else if (isRightOnScreen) visiblePartX = handlers.INVIEW_STATES.right.string;
            else visiblePartX = handlers.INVIEW_STATES.none.string;

            var inviewState = [
                measure.onscreen, //inview true/false
                visiblePartX, //left, right, both, none
                visiblePartY //top, bottom, both, none
            ];

            item._inviewPreviousState = inviewState;
            item._measurePreviousState = measure;

            item.$element.trigger('inview', inviewState );

        }
    };

    //checking loop management
    var loop = {

        lastStartEvent: 0,
        timeoutHandle: null,
        intervalDuration: 100,
        hasRaf: false,

        start: function() {

            loop.lastStartEvent = (new Date()).getTime();
            loop.repeat();

        },

        repeat: function() {

            loop.stop();

            if (loop.hasRaf) {
                loop.timeoutHandle = requestAnimationFrame(loop.main);
            } else {
                loop.timeoutHandle = setTimeout(loop.main, loop.intervalDuration);
            }

        },

        hasExpired: function() {

            var timeSinceLast = (new Date()).getTime() - loop.lastStartEvent;
            if (timeSinceLast < 1500) return;

            loop.stop()
            return true;
        },

        isThrottled: function() {
            var passedTime = (new Date()).getTime() - loop.lastMain;
            if (passedTime > loop.intervalDuration) return false;
            return true;
        },

        lastMain: (new Date()).getTime(),

        main: function() {

            if (loop.isThrottled()) {
                loop.repeat();
                return;
            }

            loop.lastMain = (new Date()).getTime();

            if (loop.hasExpired()) return;

            if (handlers.registered.length == 0) {
                //nothing to check
                loop.stop();
                //slow down to save cycles
                loop.intervalDuration = 200;
                loop.repeat();
            } else {
                //something to check
                loop.stop();
                //speed up to make more responsive
                loop.intervalDuration = 100;
                loop.repeat();
            }

            if (locking.isLocked()) return;

            handlers.process();

        },

        stop: function() {

            var intervalAttached = (loop.timeoutHandle !== null);
            if (!intervalAttached) return;

            if (loop.hasRaf) {
                cancelAnimationFrame(loop.timeoutHandle);
                loop.timeoutHandle = null;
            } else {
                clearTimeout(loop.timeoutHandle);
                loop.timeoutHandle = null;
            }

        }

    };

    //jQuery element + event handler attachment / removal
    $.extend($.event.special, {

        onscreen: {

            noBubble: true,

            add: function(data) {
                handlers.register(this, data, handlers.TYPE.onscreen);
            },

            remove: function(data) {
                handlers.unregister(this, data, handlers.TYPE.onscreen);
            }

        },

        inview: {

            noBubble: true,

            add: function(data) {
                handlers.register(this, data, handlers.TYPE.inview);
            },

            remove: function(data) {
                handlers.unregister(this, data, handlers.TYPE.inview);
            }

        }

    });

    //jQuery interfaces
    //element functions
    $.extend($.fn, {

        onscreen: function onscreen(callback) {

            if (callback) {
                //standard event attachment jquery api behaviour
                this.on("onscreen", callback);
                return this;
            }

            return measurements.get(this);

        },

        inview: function inview(callback) {

            if (callback) {
                //standard event attachment jquery api behaviour
                this.on("inview", callback);
                return this;
            }

            return measurements.get(this);

        }

    });

    //interface to allow for inview/onscreen to be disabled
    var locking =  {
        locks: [],

        lock: function(name) {

            if (locking.isLocked(name)) return;
            locking.locks.push(name);

        },

        unlock: function(name) {

            if (!locking.isLocked(name)) return;

            for (var i = 0, l = locking.locks.length; i < l; i++) {
                var lock = locking.locks[i];
                if (lock == name) {
                    locking.locks.splice(i,1);
                    break;
                }
            }

            loop.start();

        },

        isLocked: function(name) {

            if (!name) return (locking.locks.length > 0);

            for (var i = 0, l = locking.locks.length; i < l; i++) {
                var lock = locking.locks[i];
                if (lock == name) {
                    return true;
                }
            }
            return false;

        }

    };

    var config = {

        options: {},

        config: function(options) {
            if (typeof options !== "object") return;

            $.extend(config.options, options);

        }

    };


    //force an inview check - standard trigger event jquery api behaviour
    $.inview = $.onscreen = function() {
        loop.start();
    };
    //attach locking interface to $.inview.lock(name); etc
    $.extend($.inview, locking, config);

    //window size handlers
    var wndw = {

        $el: $(window),
        height: null,
        width: null,
        heightRatio: null,
        widthRatio: null,

        resize: function() {
            wndw.height = window.innerHeight || wndw.$el.height();
            wndw.width = window.innerWidth || wndw.$el.width();
            wndw.heightRatio = (100 / wndw.height);
            wndw.widthRatio = (100 / wndw.width);
            loop.start();
        }

    };

    var measurements = {

        featureDetect: function() {

            loop.hasRaf = (window.requestAnimationFrame && window.cancelAnimationFrame);

        },

        get: function get($element) {

            if ($element.length == 0) return;

            var el = $element[0];
            var offset;

            try {
                offset = el.getBoundingClientRect();
            } catch (e) {
                // IE11 throws an error if the element isn't present in the DOM
                offset = { top: 0, right: 0, bottom: 0, left: 0, width: 0, height: 0 };
            }

            var height = offset.height;
            var width = offset.width;

            //topleft from topleft of window
            var top = offset["top"];
            var left = offset["left"];

            //bottomright from bottomright of window
            var bottom = wndw.height - (top + height);
            var right = wndw.width - (left + width)

            //percentages of above
            var percentFromTop = Math.round(wndw.heightRatio * top);
            var percentFromLeft = Math.round(wndw.widthRatio * left);
            var percentFromBottom = Math.round(wndw.heightRatio * bottom);
            var percentFromRight = Math.round(wndw.widthRatio * right);

            //inview
            var inviewHorizontal = null;
            if (left+width > 0 && right < 0 && left < 0) {
                inviewHorizontal = width;
            } else if (left < 0) { //offscreen left
                inviewHorizontal = (width + left);
            } else if (left + width > wndw.width) { //offscreen right
                inviewHorizontal = (wndw.width - left);
            } else { //fully inscreen
                inviewHorizontal = width;
            }

            var inviewVertical = null;
            if (top+height > 0 && bottom < 0 && top < 0) {
                inviewVertical = height;
            } else if (top < 0) { //offscreen top
                inviewVertical = (height + top);
            } else if (top + height > wndw.height) { //offscreen bottom
                inviewVertical = (wndw.height - top);
            } else { //fully inscreen
                inviewVertical = height;
            }

            // cap floor at 0 - cannot have negative inviews.
            if (inviewVertical < 0) inviewVertical = 0;
            if (inviewHorizontal < 0) inviewHorizontal = 0;

            var percentInviewVertical = Math.round((100 / height) * inviewVertical);
            var percentInviewHorizontal = Math.round((100 / width) * inviewHorizontal);

            var elementArea = height * width;
            var inviewArea = inviewVertical * inviewHorizontal;
            var percentInview = Math.round((100 / elementArea) * inviewArea);

            var onscreen = true;
            var offScreenSide = (percentFromRight > 100 || percentFromLeft > 100 || percentFromBottom > 100 || percentFromTop > 100);
            if (offScreenSide) onscreen = false;

            var hasNoSize = (height <= 0 && width <= 0);
            if (hasNoSize) onscreen = false;

            var cssHidden = measurements.isElementHidden(el);
            if (cssHidden) onscreen = false;

            if (onscreen) {

                // perform some extra checks to make sure item is onscreen
                var parents = measurements.getParents(el);

                // go through all the parents except the html tag
                for (var i = 0, l = parents.length-1; i < l; i++) {
                    var parent = parents[i];

                    cssHidden = measurements.isElementHidden(parent);

                    // check if parents are visibility hidden or display none
                    if (cssHidden) {
                        onscreen = false;
                        break;
                    }

                    // check if child is out of bounds inside its parent
                    var isOutOfBounds = measurements.isOutOfBounds(el, parent)
                    if (isOutOfBounds) {
                        onscreen = false;
                        break;
                    }

                }

            }

            var uniqueMeasurementId = ""+top+left+bottom+right+height+width+wndw.height+wndw.width+onscreen;

            return {
                top: top,
                left: left,
                bottom: bottom,
                right: right,
                percentFromTop: percentFromTop,
                percentFromLeft: percentFromLeft,
                percentFromBottom: percentFromBottom,
                percentFromRight: percentFromRight,
                percentInview: percentInview,
                percentInviewHorizontal: percentInviewHorizontal,
                percentInviewVertical: percentInviewVertical,
                onscreen: onscreen,
                uniqueMeasurementId: uniqueMeasurementId,
                timestamp: (new Date()).getTime()
            };

        },

        getParents: function(element) {
            var parents = [];
            var parent;
            while (parent = element.parentElement) {
                parents.push(parent);
                element = parent;
            }
            return parents;
        },

        isElementHidden: function(element) {
            var cssHidden = (element.style.display == "none" || element.style.visibility == "hidden");
            if (cssHidden) return true;

            var style = window.getComputedStyle(element, null);
            cssHidden = (style.display == "none" || style.visibility == "hidden");
            return cssHidden;
        },

        isOutOfBounds: function(element, parent) {

            var isScrollWidthOverflowing = (parent.clientWidth < parent.scrollWidth);
            var isScrollHeightOverflowing = (parent.clientHeight < parent.scrollHeight);
            var isOverflowing = (isScrollWidthOverflowing || isScrollHeightOverflowing);

            var $parent = $(parent);

            if (!isOverflowing || ($parent.css("overflow") === "visible")) {
                return false;
            }

            var $element = $(element);

            var childPos = $element.offset();
            var parentPos = $parent.offset();

            var childOffsetTop = (childPos.top - parentPos.top);
            var childOffsetLeft = (childPos.left - parentPos.left);
            var childOffsetBottom = (childOffsetTop + element.clientHeight);
            var childOffsetRight = (childOffsetLeft + element.clientWidth);

            // check inclusive of bounding rectangle edges
            var isOutOfBounds = (childOffsetTop >= parent.clientHeight
                || childOffsetLeft >= parent.clientWidth
                || childOffsetBottom <= 0
                || childOffsetRight <= 0);

            return isOutOfBounds;

        }

    };

    //attach event handlers
    $(window).on({
        "touchmove scroll mousedown keydown": loop.start,
        "resize": wndw.resize
    });

    $(measurements.featureDetect);
    wndw.resize();

})();
