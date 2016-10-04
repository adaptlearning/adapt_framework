define([
    'core/js/adapt'
], function(Adapt) {
    
    var StartController = function() {
        this.initialize();
    };

    _.extend(StartController.prototype, {

        model: null,

        initialize: function() {
            this.model = new Backbone.Model(Adapt.course.get("_start"));
        },

        setStartLocation: function() {
            if (!this.isEnabled()) return;

            window.location.hash = this.getStartHash();
        },

        getStartHash: function(alwaysForce) {
            var startId = this.getStartId();

            var hasStartId = (startId)
                ? true
                : false;

            var isRouteSpecified = (_.indexOf(window.location.href,"#") > -1);
            var shouldForceStartId = alwaysForce || this.model.get("_force");
            var shouldNavigateToStartId = hasStartId && (!isRouteSpecified || shouldForceStartId);

            var startHash = "#/";
            if (shouldNavigateToStartId) {
                if (startId !== Adapt.course.get("_id")) {
                    startHash = "#/id/"+startId;
                }
            } else {
                //go to specified route or course main menu
                var hasLocationHash = (window.location.hash)
                    ? true
                    : false;

                startHash = hasLocationHash ? window.location.hash : startHash;
            }

            return startHash;
        },

        isEnabled: function() {
            if (!this.model || !this.model.get("_isEnabled")) return false;
            return true;
        },

        getStartId: function() {
            var startId = this.model.get("_id");
            var startIds = this.model.get("_startIds");

            var hasStartIdsConfiguration = (startIds && startIds.length > 0);
            if (hasStartIdsConfiguration) {
                for (var i = 0, l =  startIds.length; i < l; i++) {
                    var item = startIds[i];
                    var className =  item._className;
                    var skipIfComplete = item._skipIfComplete;
                    
                    var model = Adapt.findById(item._id);
                    
                    if (!model) {
                        console.log("startController: cannot find id", item._id);
                        continue;
                    }
                    
                    if (skipIfComplete) {
                        if (model.get("_isComplete")) continue;
                    }

                    if (!className || $("html").is(className)) {
                        startId = item._id;
                        break;
                    }
                }
            }

            return startId;
        }

    });

    Adapt.once("adapt:start", function() {
        var startController = new StartController();
        startController.setStartLocation();
    });

    return StartController;

});