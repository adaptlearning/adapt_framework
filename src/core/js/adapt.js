define([
  'core/js/wait',
  'core/js/models/lockingModel'
], function(Wait) {

  class Adapt extends Backbone.Model {

    initialize() {
      this.loadScript = window.__loadScript;
      this.location = {};
      this.componentStore = {};
      this.setupWait();
    }

    defaults() {
      return {
        _canScroll: true, // to stop scrollTo behaviour,
        _outstandingCompletionChecks: 0,
        _pluginWaitCount: 0,
        _isStarted: false
      };
    }

    lockedAttributes() {
      return {
        _canScroll: false
      };
    }

    init() {
      this.addDirection();
      this.disableAnimation();
      this.trigger('adapt:preInitialize');

      // wait until no more completion checking
      this.deferUntilCompletionChecked(() => {

        // start adapt in a full restored state
        this.trigger('adapt:start');

        if (!Backbone.History.started) {
          Backbone.history.start();
        }

        this.set('_isStarted', true);

        this.trigger('adapt:initialize');

      });
    }

    /**
     * call when entering an asynchronous completion check
     */
    checkingCompletion() {
      const outstandingChecks = this.get('_outstandingCompletionChecks');
      this.set('_outstandingCompletionChecks', outstandingChecks + 1);
    }

    /**
     * call when exiting an asynchronous completion check
     */
    checkedCompletion() {
      const outstandingChecks = this.get('_outstandingCompletionChecks');
      this.set('_outstandingCompletionChecks', outstandingChecks - 1);
    }

    /**
     * wait until there are no outstanding completion checks
     * @param {Function} callback Function to be called after all completion checks have been completed
     */
    deferUntilCompletionChecked(callback) {
      if (this.get('_outstandingCompletionChecks') === 0) return callback();

      const checkIfAnyChecksOutstanding = (model, outstandingChecks) => {
        if (outstandingChecks !== 0) return;
        this.off('change:_outstandingCompletionChecks', checkIfAnyChecksOutstanding);
        callback();
      };

      this.on('change:_outstandingCompletionChecks', checkIfAnyChecksOutstanding);

    }

    setupWait() {

      this.wait = new Wait();

      // Setup legacy events and handlers
      const beginWait = () => {
        this.log.deprecated("Use Adapt.wait.begin() as Adapt.trigger('plugin:beginWait') may be removed in the future");
        this.wait.begin();
      };

      const endWait = () => {
        this.log.deprecated("Use Adapt.wait.end() as Adapt.trigger('plugin:endWait') may be removed in the future");
        this.wait.end();
      };

      const ready = () => {
        if (this.wait.isWaiting()) {
          return;
        }
        const isEventListening = (this._events['plugins:ready']);
        if (!isEventListening) {
          return;
        }
        this.log.deprecated("Use Adapt.wait.queue(callback) as Adapt.on('plugins:ready', callback) may be removed in the future");
        this.trigger('plugins:ready');
      };

      this.listenTo(this.wait, 'ready', ready);
      this.listenTo(this, {
        'plugin:beginWait': beginWait,
        'plugin:endWait': endWait
      });

    }

    isWaitingForPlugins() {
      this.log.deprecated('Use Adapt.wait.isWaiting() as Adapt.isWaitingForPlugins() may be removed in the future');
      return this.wait.isWaiting();
    }

    checkPluginsReady() {
      this.log.deprecated('Use Adapt.wait.isWaiting() as Adapt.checkPluginsReady() may be removed in the future');
      if (this.isWaitingForPlugins()) {
        return;
      }
      this.trigger('plugins:ready');
    }

    /**
     * Allows a selector to be passed in and Adapt will navigate to this element
     * @param {string} selector CSS selector of the Adapt element you want to navigate to e.g. `".co-05"`
     * @param {object} [settings] The settings for the `$.scrollTo` function (See https://github.com/flesler/jquery.scrollTo#settings).
     * You may also include a `replace` property that you can set to `true` if you want to update the URL without creating an entry in the browser's history.
     */
    navigateToElement(selector, settings = {}) {
      // Removes . symbol from the selector to find the model
      const currentModelId = selector.replace(/\./g, '');
      const currentModel = this.data.findById(currentModelId);
      // Get current page to check whether this is the current page
      const currentPage = (currentModel._siblings === 'contentObjects') ? currentModel : currentModel.findAncestor('contentObjects');

      // If current page - scrollTo element
      if (currentPage.get('_id') === this.location._currentId) {
        return this.scrollTo(selector, settings);
      }

      // If the element is on another page navigate and wait until pageView:ready is fired
      // Then scrollTo element
      this.once('pageView:ready', _.debounce(() => {
        this.router.set('_shouldNavigateFocus', true);
        this.scrollTo(selector, settings);
      }, 1));

      const shouldReplaceRoute = settings.replace || false;

      this.router.set('_shouldNavigateFocus', false);
      Backbone.history.navigate('#/id/' + currentPage.get('_id'), { trigger: true, replace: shouldReplaceRoute });
    }

    /**
     * Used to register components with the Adapt 'component store'
     * @param {string} name The name of the component to be registered
     * @param {object} object Object containing properties `model` and `view` or (legacy) an object representing the view
     */
    register(name, object) {
      if (this.componentStore[name]) {
        throw Error('The component "' + name + '" already exists in your project');
      }

      if (object.view) {
        // use view+model object
        if (!object.view.template) object.view.template = name;
      } else {
        // use view object
        if (!object.template) object.template = name;
      }

      this.componentStore[name] = object;

      return object;
    }

    /**
     * Fetches a component view class from the componentStore. For a usage example, see either HotGraphic or Narrative
     * @param {string} name The name of the componentView you want to fetch e.g. `"hotgraphic"`
     * @returns {ComponentView} Reference to the view class
     */
    getViewClass(name) {
      const object = this.componentStore[name];
      if (!object) {
        throw Error('The component "' + name + '" doesn\'t exist in your project');
      }
      return object.view || object;
    }

    /**
     * Looks up which collection a model belongs to
     * @param {string} id The id of the item you want to look up e.g. `"co-05"`
     * @return {string} One of the following (or `undefined` if not found):
     * - "course"
     * - "contentObjects"
     * - "blocks"
     * - "articles"
     * - "components"
     */
    mapById(id) {
      return this.data.mapById(id);
    }

    /**
     * Looks up a model by its `_id` property
     * @param {string} id The id of the item e.g. "co-05"
     * @return {Backbone.Model}
     */
    findById(id) {
      return this.data.findById(id);
    }

    findViewByModelId(id) {
      const model = this.data.findById(id);
      if (!model) return;

      if (model === this.parentView.model) return this.parentView;

      const idPathToView = [id];
      const currentLocationId = this.location._currentId;
      const currentLocationModel = model.getAncestorModels().find(model => {
        const modelId = model.get('_id');
        if (modelId === currentLocationId) return true;
        idPathToView.unshift(modelId);
      });

      if (!currentLocationModel) {
        return console.warn(`Adapt.findViewByModelId() unable to find view for model id: ${id}`);
      }

      const foundView = idPathToView.reduce((view, currentId) => {
        return view && view.childViews && view.childViews[currentId];
      }, this.parentView);

      return foundView;
    }

    /**
     * Relative strings describe the number and type of hops in the model hierarchy
     * @param {string} relativeString "@component +1" means to move one component forward from the current model
     * This function would return the following:
     * {
     *     type: "component",
     *     offset: 1
     * }
     * Trickle uses this function to determine where it should scrollTo after it unlocks
     */
    parseRelativeString(relativeString) {
      if (relativeString[0] === '@') {
        relativeString = relativeString.substr(1);
      }

      let type = relativeString.match(/(component|block|article|page|menu)/);
      if (!type) {
        this.log.error('Adapt.parseRelativeString() could not match relative type', relativeString);
        return;
      }
      type = type[0];

      const offset = parseInt(relativeString.substr(type.length).trim() || 0);
      if (isNaN(offset)) {
        this.log.error('Adapt.parseRelativeString() could not parse relative offset', relativeString);
        return;
      }

      return {
        type: type,
        offset: offset
      };

    }

    addDirection() {
      const defaultDirection = this.config.get('_defaultDirection');

      $('html')
        .addClass('dir-' + defaultDirection)
        .attr('dir', defaultDirection);
    }

    disableAnimation() {
      const disableAnimationArray = this.config.get('_disableAnimationFor');
      const disableAnimation = this.config.get('_disableAnimation');

      // Check if animations should be disabled
      if (disableAnimationArray && disableAnimationArray.length > 0) {
        for (let i = 0; i < disableAnimationArray.length; i++) {
          if ($('html').is(disableAnimationArray[i])) {
            this.config.set('_disableAnimation', true);
            $('html').addClass('disable-animation');
            console.log('Animation disabled.');
          }
        }
        return;
      }

      $('html').toggleClass('disable-animation', (disableAnimation === true));
    }

    remove() {
      this.trigger('preRemove');
      this.trigger('remove');
      _.defer(this.trigger.bind(this), 'postRemove');
    }

  }

  return new Adapt();
});
