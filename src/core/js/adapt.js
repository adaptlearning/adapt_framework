define([
  'core/js/models/lockingModel',
  'core/js/wait'
], function(lockingModel, Wait) {

  var AdaptModel = Backbone.Model.extend({

    defaults: {
      _canScroll: true, //to stop scrollTo behaviour,
      _outstandingCompletionChecks: 0,
      _pluginWaitCount:0,
      _isStarted: false
    },

    lockedAttributes: {
      _canScroll: false
    },

    initialize: function () {
      this.setupWait();
    },

    //call when entering an asynchronous completion check
    checkingCompletion: function() {
      var outstandingChecks = this.get("_outstandingCompletionChecks");
      this.set("_outstandingCompletionChecks", ++outstandingChecks);
    },

    //call when exiting an asynchronous completion check
    checkedCompletion: function() {
      var outstandingChecks = this.get("_outstandingCompletionChecks");
      this.set("_outstandingCompletionChecks", --outstandingChecks);
    },

    //wait until there are no outstanding completion checks
    deferUntilCompletionChecked: function(callback) {

      if (this.get("_outstandingCompletionChecks") === 0) return callback();

      var checkIfAnyChecksOutstanding = function(model, outstandingChecks) {
        if (outstandingChecks !== 0) return;

        Adapt.off("change:_outstandingCompletionChecks", checkIfAnyChecksOutstanding);

        callback();
      };

      Adapt.on("change:_outstandingCompletionChecks", checkIfAnyChecksOutstanding);

    },

    setupWait: function() {

      this.wait = new Wait();

      // Setup legcay events and handlers
      var beginWait = function () {
        Adapt.log.warn("DEPRECATED - Use Adapt.wait.begin() as Adapt.trigger('plugin:beginWait') may be removed in the future");
        this.wait.begin();
      }.bind(this);

      var endWait = function() {
        Adapt.log.warn("DEPRECATED - Use Adapt.wait.end() as Adapt.trigger('plugin:endWait') may be removed in the future");
        this.wait.end();
      }.bind(this);

      var ready = function() {

        if (this.wait.isWaiting()) {
          return;
        }

        var isEventListening = (this._events['plugins:ready']);
        if (!isEventListening) {
          return;
        }

        Adapt.log.warn("DEPRECATED - Use Adapt.wait.queue(callback) as Adapt.on('plugins:ready', callback) may be removed in the future");
        this.trigger('plugins:ready');

      }.bind(this);

      this.listenTo(this.wait, "ready", ready);
      this.listenTo(this, {
        'plugin:beginWait': beginWait,
        'plugin:endWait': endWait
      });

    },

    isWaitingForPlugins:function() {
      Adapt.log.warn("DEPRECATED - Use Adapt.wait.isWaiting() as Adapt.isWaitingForPlugins() may be removed in the future");
      return this.wait.isWaiting();
    },

    checkPluginsReady:function() {
      Adapt.log.warn("DEPRECATED - Use Adapt.wait.isWaiting() as Adapt.checkPluginsReady() may be removed in the future");
      if (this.isWaitingForPlugins()) {
        return;
      }
      this.trigger('plugins:ready');
    }

  });

  var Adapt = new AdaptModel();

  Adapt.location = {};
  Adapt.componentStore = {};
  Adapt.mappedIds = {};

  Adapt.loadScript = window.__loadScript;

  Adapt.initialize = function() {

    //wait until no more completion checking
    Adapt.deferUntilCompletionChecked(function() {

      //start adapt in a full restored state
      Adapt.trigger('adapt:start');

      if (!Backbone.History.started) {
        Backbone.history.start();
      }

      Adapt.set("_isStarted", true);

      Adapt.trigger('adapt:initialize');

    });

  };

  Adapt.navigateToElement = function(selector, settings) {
    // Allows a selector to be passed in and Adapt will navigate to this element

    // Setup settings object
    var settings = (settings || {});

    // Removes . symbol from the selector to find the model
    var currentModelId = selector.replace(/\./g, '');
    var currentModel = Adapt.findById(currentModelId);
    // Get current page to check whether this is the current page
    var currentPage = (currentModel._siblings === 'contentObjects') ? currentModel : currentModel.findAncestor('contentObjects');

    // If current page - scrollTo element
    if (currentPage.get('_id') === Adapt.location._currentId) {
      return Adapt.scrollTo(selector, settings);
    }

    // If the element is on another page navigate and wait until pageView:ready is fired
    // Then scrollTo element
    Adapt.once('pageView:ready', function() {
      _.defer(function() {
        Adapt.router.set("_shouldNavigateFocus", true);
        Adapt.scrollTo(selector, settings);
      });
    });

    var shouldReplaceRoute = settings.replace || false;

    Adapt.router.set("_shouldNavigateFocus", false);
    Backbone.history.navigate('#/id/' + currentPage.get('_id'), {trigger: true, replace: shouldReplaceRoute});
  };

  Adapt.register = function(name, object) {
    // Used to register components
    // Store the component view
    if (Adapt.componentStore[name]) {
      throw Error('The component "' + name + '" already exists in your project');
    }

    if (object.view) {
      //use view+model object
      if(!object.view.template) object.view.template = name;
    } else {
      //use view object
      if(!object.template) object.template = name;
    }

    Adapt.componentStore[name] = object;

    return object;
  };

  Adapt.getViewClass = function(name) {
    var object = Adapt.componentStore[name];
    if (!object) {
      throw Error('The component "' + name + '" doesn\'t exist in your project');
    }
    return object.view || object;
  };

  // Used to map ids to collections
  Adapt.setupMapping = function() {
    // Clear any existing mappings.
    Adapt.mappedIds = {};

    // Setup course Id
    Adapt.mappedIds[Adapt.course.get('_id')] = "course";

    // Setup each collection
    var collections = ["contentObjects", "articles", "blocks", "components"];

    for (var i = 0, len = collections.length; i < len; i++) {
      var collection = collections[i];
      var models = Adapt[collection].models;
      for (var j = 0, lenj = models.length; j < lenj; j++) {
        var model = models[j];
        Adapt.mappedIds[model.get('_id')] = collection;

      }
    }

  };

  Adapt.mapById = function(id) {
    // Returns collection name that contains this models Id
    return Adapt.mappedIds[id];
  };

  Adapt.findById = function(id) {

    // Return a model
    // Checks if the Id passed in is the course Id
    if (id === Adapt.course.get('_id')) {
      return Adapt.course;
    }

    var collectionType = Adapt.mapById(id);

    if (!collectionType) {
      console.warn('Adapt.findById() unable to find collection type for id: ' + id);
      return;
    }

    return Adapt[collectionType]._byAdaptID[id][0];

  };

  // Relative strings describe the number and type of hops in the model hierarchy
  //
  // "@component +1" means to move one component forward from the current model
  // This function would return the following:
  // {
  //       type: "component",
  //       offset: 1
  // }
  // Trickle uses this function to determine where it should scrollTo after it unlocks
  Adapt.parseRelativeString = function(relativeString) {

    if (relativeString[0] === "@") {
      relativeString = relativeString.substr(1);
    }

    var type = relativeString.match(/(component|block|article|page|menu)/);
    if (!type) {
      Adapt.log.error("Adapt.parseRelativeString() could not match relative type", relativeString);
      return;
    }
    type = type[0];

    var offset = parseInt(relativeString.substr(type.length).trim()||0);
    if (isNaN(offset)) {
      Adapt.log.error("Adapt.parseRelativeString() could not parse relative offset", relativeString);
      return;
    }

    return {
      type: type,
      offset: offset
    };

  };

  Adapt.remove = function() {
    Adapt.trigger('preRemove');
    Adapt.trigger('remove');
    _.defer(function() {
      Adapt.trigger('postRemove');
    });
  };

  return Adapt;

});
