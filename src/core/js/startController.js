define([
  'core/js/adapt'
], function(Adapt) {

  var StartController = Backbone.Controller.extend({

    model: null,

    loadCourseData: function() {
      this.model = new Backbone.Model(Adapt.course.get('_start'));
    },

    setStartLocation: function() {
      if (!this.isEnabled()) return;
      window.history.replaceState('', '', this.getStartHash());
    },

    returnToStartLocation: function() {
      var startIds = this.model.get('_startIds');
      if (startIds) {
        // ensure we can return to the start page even if it is completed
        startIds.forEach(function(startId) {
          startId._skipIfComplete = false;
        });
      }
      window.location.hash = this.getStartHash(true);
    },

    /**
     * Returns a string in URL.hash format representing the route that the course should be sent to
     * @param {boolean} [alwaysForce] Ignore any route specified in location.hash and force use of the start page instead
     * @return {string}
     */
    getStartHash: function(alwaysForce) {
      var startId = this.getStartId();
      var isRouteSpecified = window.location.href.indexOf('#') > -1;
      var shouldForceStartId = alwaysForce || this.model.get('_force');
      var shouldNavigateToStartId = startId && (!isRouteSpecified || shouldForceStartId);

      if (shouldNavigateToStartId && startId !== Adapt.course.get('_id')) {
        return '#/id/' + startId;
      }

      //if there's a route specified in location.hash, use that - otherwise go to main menu
      return window.location.hash || '#/';
    },

    isEnabled: function() {
      if (!this.model || !this.model.get('_isEnabled')) return false;
      return true;
    },

    getStartId: function() {
      var startId = this.model.get('_id');
      var startIds = this.model.get('_startIds');

      if (!startIds || !startIds.length) return startId;

      var $html = $('html');
      for (var i = 0, l =  startIds.length; i < l; i++) {
        var item = startIds[i];
        var className =  item._className;
        var skipIfComplete = item._skipIfComplete;

        var model = Adapt.findById(item._id);

        if (!model) {
          console.log('startController: cannot find id', item._id);
          continue;
        }

        if (skipIfComplete) {
          if (model.get('_isComplete')) continue;
        }

        if (!className || $html.is(className) || $html.hasClass(className)) {// see https://github.com/adaptlearning/adapt_framework/issues/1843
          startId = item._id;
          break;
        }
      }

      return startId;
    }

  });

  Adapt.once('adapt:start', function() {
    Adapt.startController.loadCourseData();
    Adapt.startController.setStartLocation();
  });

  /*
  * allows you to call returnToStartLocation either by calling `Adapt.trigger('navigation:returnToStart')`
  * or by including in the top navigation bar a button that has the attribute `data-event="returnToStart"`
  */
  Adapt.on('navigation:returnToStart', function() {
    Adapt.startController.returnToStartLocation();
  });

  return (Adapt.startController = new StartController());

});
