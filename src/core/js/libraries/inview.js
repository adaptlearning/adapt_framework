// jquery.onscreen 2015-08-13 https://github.com/adaptlearning/jquery.onscreen

(function() {
	var expando = $.expando;

	//element + event handler storage
	var onScreenObjs = {};
	var inViewObjs = {};

	//jQuery element + event handler attachment / removal
	$.event.special.onscreen = {
		add: function(data) {
			onScreenObjs[data.guid + "-" + this[expando]] = { 
				data: data, 
				$element: $(this) 
			};
		},

		remove: function(data) {
			try { 
				delete onScreenObjs[data.guid + "-" + this[expando]]; 
			} catch(e) {

			}
		}
  	};
	$.event.special.inview = {
		add: function(data) {
			inViewObjs[data.guid + "-" + this[expando]] = {
				data: data, 
				$element: $(this) 
			};
		},

		remove: function(data) {
			try { 
				delete inViewObjs[data.guid + "-" + this[expando]]; 
			} catch(e) {

			}
		}
  	};


  	function getElementOnScreenMeasurements($element) {
  		if ($element.length === 0) return;
  		
		var height = $element.outerHeight();
		var width = $element.outerWidth();
		var wHeight = $(window).height();
		var wWidth = $(window).width();
		
		//topleft from topleft of window
		var top = $element.offset()["top"] - $(window).scrollTop();
		var left = $element.offset()["left"] - $(window).scrollLeft();

		//bottomright from bottomright of window
		var bottom = wHeight - (top + height);
		var right = wWidth - (left + width);
		
		//percentages of above
		var topP = Math.round((100 /  wHeight) * top);
		var leftP = Math.round((100 / wWidth) * left);
		var bottomP = Math.round((100 /  wHeight) * (wHeight - (top + height)));
		var rightP = Math.round((100 / wWidth) * (wWidth - (left + width)));


		//inview
		var inviewH = null;
		if (left+width > 0 && right < 0 && left < 0) {
			inviewH = width;
		} else if (left < 0) { //offscreen left
			inviewH = (width + left);
		} else if (left + width > wWidth) { //offscreen right
			inviewH = (wWidth - left);
		} else { //fully inscreen
			inviewH = width;
		}

		var inviewV = null;
		if (top+height > 0 && bottom < 0 && top < 0) {
			inviewV = height;
		} else if (top < 0) { //offscreen top
			inviewV = (height + top);
		} else if (top + height > wHeight) { //offscreen bottom
			inviewV = (wHeight - top);
		} else { //fully inscreen
			inviewV = height;
		}

		var area = height * width;
		var inviewArea = inviewV * inviewH;
		var inviewP = Math.round((100 / area) * inviewArea);
		var inviewHeightP = Math.round((100 / height) * inviewV);
		var inviewWidthP = Math.round((100 / width) * inviewH);

		var uniq = ""+top+left+bottom+right+height+width+wHeight+wWidth;

		var onscreen = true;
		if (rightP > 100 || leftP > 100 || bottomP > 100 || topP > 100) onscreen = false;
		if (!$element.is(":visible") || $element.css("visibility") == "hidden") onscreen = false;

		return { 
			top: top, 
			left: left, 
			bottom: bottom, 
			right: right, 
			percentFromTop: topP, 
			percentFromLeft: leftP, 
			percentFromBottom: bottomP, 
			percentFromRight: rightP, 
			percentInview: inviewP, 
			percentInviewHorizontal: inviewWidthP,
			percentInviewVertical: inviewHeightP,
			onscreen: onscreen,
			uniqueMeasurementId: uniq 
		};
	}

	function checkLoopExpired() {
		if ((new Date()).getTime() - loopData.lastEvent > 500) {
			stopLoop()
			return true;
		}
	}

	function onScreenLoop () {
		if (checkLoopExpired()) return;

		var onScreenHandlers = getEventHandlers("onscreen");
		var inViewHandlers = getEventHandlers("inview");

		if (onScreenHandlers.length === 0 && inViewHandlers.length === 0) {
			//nothing to onscreen
			stopLoop();
			$.fn.onscreen.intervalDuration = 250;
			repeatLoop();
		} else {
			//something to onscreen
			stopLoop();
			$.fn.onscreen.intervalDuration = 125;
			repeatLoop();
		}

		if  (onScreenHandlers.length > 0) {
			var items = onScreenHandlers;
			for (var i = 0; i < items.length; i++) {
				var item = items[i];
				triggerOnScreen(item);
			}
		}
		if  (inViewHandlers.length > 0) {
			var items = inViewHandlers;
			for (var i = 0; i < items.length; i++) {
				var item = items[i];
				triggerInview(item);
			}
		}

	}

	function getEventHandlers(eventName) {
		var items = [];
		
		switch (eventName) {
		case "inview":
			for (var k in inViewObjs) {
				items.push(inViewObjs[k]);
			}
			break;
		case "onscreen":
			for (var k in onScreenObjs) {
				items.push(onScreenObjs[k]);
			}
			break;
		}

		return items;
	}

	function triggerOnScreen(item) {
		var measure = getElementOnScreenMeasurements(item.$element);
		//check if measure has the same values as last
		if (item._onscreen !== undefined && item._onscreen === measure.uniqueMeasurementId) return;
		item._onscreen = measure.uniqueMeasurementId;

		item.$element.trigger('onscreen', measure );
	}

	function triggerInview(item) {
		var measure = getElementOnScreenMeasurements(item.$element);

		//check if measure has the same values as last
		if (item._onscreen !== undefined && item._onscreen === measure.uniqueMeasurementId) return;
		item._onscreen = measure.uniqueMeasurementId;

		var visiblePartY = (measure.percentFromTop > 0 && measure.percentFromTop < 100) && (measure.percentFromBottom > 0 && measure.percentFromBottom < 100) ? "both" : (measure.percentFromTop > 0 && measure.percentFromTop < 100) ? "top" : (measure.percentFromBottom > 0 && measure.percentFromBottom < 100) ? "bottom" : "none";
		var visiblePartX = (measure.percentFromLeft > 0 && measure.percentFromLeft < 100) && (measure.percentFromRight > 0 && measure.percentFromRight < 100) ? "both" : (measure.percentFromLeft > 0 && measure.percentFromLeft < 100) ? "left" : (measure.percentFromRight > 0 && measure.percentFromRight < 100) ? "right" : "none";

		var inviewState = [
			measure.onscreen, //inview true/false
			visiblePartX, //left, right, both, none
			visiblePartY //top, bottom, both, none
		];

		if (item._inviewPreviousState !== undefined ) {
			//check previous state and current state
			var scrolledOver = (item._measurePreviousState.percentFromBottom < 0 && measure.percentFromBottom > 100 );
			
			//if inview state hasn't changed, don't retrigger event
			if (item._inviewPreviousState[0] === inviewState[0] &&
				item._inviewPreviousState[1] === inviewState[1] && 
				item._inviewPreviousState[2] === inviewState[2] &&
				!scrolledOver) return;

			if (scrolledOver) {
				//make sure to trigger a scrolled over both top and bottom event
				inviewState[0] = true;
				inviewState[1] = "both";
				inviewState[2] = "both";
			}
		}

		item._inviewPreviousState = inviewState;
		item._measurePreviousState = measure;

		item.$element.trigger('inview', inviewState );
	}


	//jQuery element function
	$.fn.onscreen = function() {
		return getElementOnScreenMeasurements($(this[0]));
	};

	//checking loop interval duration
	$.fn.onscreen.intervalDuration = 125;

	var loopData = {
		lastEvent: 0,
		interval: null
	};

	//checking loop start and end
	function startLoop() {
		loopData.lastEvent = (new Date()).getTime();
		if (loopData.interval !== null) {
			stopLoop();
		}
		loopData.interval = setTimeout(onScreenLoop, $.fn.onscreen.intervalDuration);
	}

	function repeatLoop() {
		if (loopData.interval !== null) {
			stopLoop();
		}
		loopData.interval = setTimeout(onScreenLoop, $.fn.onscreen.intervalDuration);
	}

	function stopLoop() {
		clearInterval(loopData.interval);
		loopData.interval = null;
	}

	$(window).on("scroll", startLoop);
	$(window).on("resize", startLoop);


})();
