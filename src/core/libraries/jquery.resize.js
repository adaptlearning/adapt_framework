'use strict';
// jquery.resize 2020-05-27

(function() {

  // skip if library is already handling resize events
  if ($.event.special.resize) return;
  // skip if old library has been loaded
  if ($.fn.off.elementResizeOriginalOff) return;

  // handler id generation
  var expando = {

    index: 0,

    check: function(element) {
      // check that the element has a valid jquery expando property, or make one

      var hasExpando = (element[$.expando]);
      if (hasExpando) return;

      element[$.expando] = ++expando.index;

    },

    make: function(element, data) {
      // make a unique event id from the element's expando property and the event handler guid

      expando.check(element);
      return data.guid + "-" + element[$.expando];

    }

  };

  // handler functions
  var handlers = {

    registered: [],
    shouldReProcess: true,

    register: function(element, data) {

      var $element = $(element);
      handlers.registered.push({
        id: expando.make(element, data),
        $element: $element,
        _measurement: measurements.get($element).uniqueMeasurementId,
        _hasTriggered: false
      });
      handlers.shouldReProcess = true;

    },

    unregister: function(element, data) {

      var registered = handlers.registered;

      var findId = expando.make(element, data);
      for (var i = registered.length-1, l = -1; i > l; i--) {
        var item = registered[i]
        if (item.id != findId) continue;
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
        if (registeredCount == 0) return;

        for (var i = 0; i < registeredCount; i++) {
          var item = registered[i];
          var measure = measurements.get(item.$element);

          // check if measure has the same values as last
          var wasPreviouslyMeasured = (item._measurement !== undefined);

          if (wasPreviouslyMeasured && item._hasTriggered) {
            var hasMeasureChanged = (item._measurement != measure.uniqueMeasurementId);
            if (!hasMeasureChanged) {
              continue;
            }
          }

          item._measurement = measure.uniqueMeasurementId;
          item._hasTriggered = true;

          handlers.trigger(item);

          if (handlers.shouldReProcess) {
            break;
          }

        }
      }

    },

    trigger: function triggerResize(item) {

      item.$element.trigger('resize');

    }

  };

  // checking loop management
  var loop = {

    lastStartEvent: 0,
    timeoutHandle: null,
    intervalDuration: 100,
    hasRaf: false,

    start: function() {

      loop.lastStartEvent = (new Date()).getTime();
      loop.repeat();

    },

    force: function() {

      loop.lastStartEvent = (new Date()).getTime();
      loop.main(true);
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

    lastMain: (new Date()).getTime(),

    isThrottled: function() {
      var passedTime = (new Date()).getTime() - loop.lastMain;
      if (passedTime > loop.intervalDuration) return false;
      return true;
    },

    main: function(force) {

      if (force !== true && loop.isThrottled()) {
        loop.repeat();
        return;
      }

      loop.lastMain = (new Date()).getTime();

      if (force !== true && loop.hasExpired()) {
        loop.stop();
        return;
      }

      if (handlers.registered.length == 0) {
        // nothing to check
        loop.stop();
        // slow down to save cycles
        loop.intervalDuration = 200;
        loop.repeat();
      } else {
        // something to check
        loop.stop();
        // speed up to make more responsive
        loop.intervalDuration = 100;
        loop.repeat();
      }

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

  // jQuery element + event handler attachment / removal
  $.extend($.event.special, {

    resize: {

      noBubble: true,

      add: function(data) {
        // allow window resize to be handled by browser
        if (this === window) return;
        handlers.register(this, data);
      },

      remove: function(data) {
        // allow window resize to be handled by browser
        if (this === window) return;
        handlers.unregister(this, data);
      }

    }

  });

  var measurements = {

    featureDetect: function() {

      loop.hasRaf = (window.requestAnimationFrame && window.cancelAnimationFrame);

    },

    get: function($element) {

      var element = $element[0];
      var height = element.clientHeight;
      var width = element.clientWidth;

      return {
        uniqueMeasurementId: height+","+width
      };

    }

  };

  //attach event handlers
  $(window).on({
    "touchmove scroll mousedown keydown": loop.start, // asynchronous
    "resize": loop.force // synchronous
  });
  $(measurements.featureDetect);

})();
