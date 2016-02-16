define([
	'coreJS/adapt'
], function(Adapt) {

	/*example

		"_start": {
	        "_isEnabled": true,
	        "_screenSize": [
	            {
	                "_className": ".size-small.touch, .size-medium.touch",
	                "_id": "co-05"
	            },
	            {
	                "_className": ".size-small.no-touch, .size-medium.no-touch",
	                "_id": "co-10"
	            }
	        ],
	        "_id": "course",
	        "_force": true
	    },

    */

	var StartController = function() {
		this.initialize();
	};

	_.extend(StartController.prototype, {

		model: null,

		initialize: function() {
			this.model = new Backbone.Model(Adapt.course.get("_start"));

	        this.setStartLocation();
	    },

	    setStartLocation: function() {
	    	if (!this.isEnabled()) return;

	        var startId = this.getStartId();

	        var hasStartId = (startId)
	            ? true
	            : false;

	        var isRouteSpecified = (_.indexOf(window.location.href,"#") > -1);
	        var shouldForceStartId = this.model.get("_force");
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

	        window.location.hash = startHash;
	    },

	    isEnabled: function() {
	        if (!this.model || !this.model.get("_isEnabled")) return false;
	        return true;
	    },

	    getStartId: function() {
	        var startId = this.model.get("_id");
	        var screenSize = this.model.get("_screenSize");

	        var hasScreenSizeConfiguration = (screenSize && screenSize.length > 0);
	        if (hasScreenSizeConfiguration) {
	            /* takes
	                [
	                    {
	                        "_className": ".small.touch",
	                        "_id": "co-30"
	                    }
	                ]
	            */
	            for (var i = 0, l =  screenSize.length; i < l; i++) {
	                var item = screenSize[i];
	                var className =  item._className;

	                if ($("html").is(className)) {
	                    startId = item._id;
	                    break;
	                }
	            }
	        }

	        return startId;
	    }

	});


	Adapt.once("adapt:start", function() {
		new StartController();
	});


	return StartController;


})