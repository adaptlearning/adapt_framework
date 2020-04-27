define([
  'core/js/wait',
  'core/js/models/lockingModel'
], function(Wait) {

  class Adapt extends Backbone.Model {

    initialize() {
      this.loadScript = window.__loadScript;
      this.location = {};
      this.store = {};
      this.setupWait();
    }

    defaults() {
      return {
        _canScroll: true, // to stop scrollTo behaviour,
        _outstandingCompletionChecks: 0,
        _pluginWaitCount: 0,
        _isStarted: false,
        _shouldDestroyContentObjects: true
      };
    }

    lockedAttributes() {
      return {
        _canScroll: false
      };
    }

    /**
     * @deprecated since v6.0.0 - please use `Adapt.store` instead
     */
    get componentStore() {
      this.log && this.log.deprecated('Adapt.componentStore, please use Adapt.store instead');
      return this.store;
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
        this.log.deprecated(`Use Adapt.wait.begin() as Adapt.trigger('plugin:beginWait') may be removed in the future`);
        this.wait.begin();
      };

      const endWait = () => {
        this.log.deprecated(`Use Adapt.wait.end() as Adapt.trigger('plugin:endWait') may be removed in the future`);
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
     * @param {object} [settings={}] The settings for the `$.scrollTo` function (See https://github.com/flesler/jquery.scrollTo#settings).
     * You may also include a `replace` property that you can set to `true` if you want to update the URL without creating an entry in the browser's history.
     */
    navigateToElement() {}

    /**
     * Allows a selector to be passed in and Adapt will scroll to this element
     * @param {string} selector CSS selector of the Adapt element you want to navigate to e.g. `".co-05"`
     * @param {object} [settings={}] The settings for the `$.scrollTo` function (See https://github.com/flesler/jquery.scrollTo#settings).
     * You may also include a `replace` property that you can set to `true` if you want to update the URL without creating an entry in the browser's history.
     */
    scrollTo() {}

    /**
     * Used to register models and views with `Adapt.store`
     * @param {string|Array} name The name(s) of the model/view to be registered
     * @param {object} object Object containing properties `model` and `view` or (legacy) an object representing the view
     */
    register(name, object) {
      if (Array.isArray(name)) {
        // if an array is passed, iterate by recursive call
        name.forEach(name => this.register(name, object));
        return object;
      }

      if (name.split(' ').length > 1) {
        // if name with spaces is passed, split and pass as array
        this.register(name.split(' '), object);
        return object;
      }

      if ((!object.view && !object.model) || object instanceof Backbone.View) {
        this.log && this.log.deprecated('View-only registrations are no longer supported');
        object = { view: object };
      }

      if (object.view && !object.view.template) {
        object.view.template = name;
      }

      const isModelSetAndInvalid = (object.model &&
        !(object.model.prototype instanceof Backbone.Model) &&
        !(object.model instanceof Function));
      if (isModelSetAndInvalid) {
        throw new Error('The registered model is not a Backbone.Model or Function');
      }

      const isViewSetAndInvalid = (object.view &&
        !(object.view.prototype instanceof Backbone.View) &&
        !(object.view instanceof Function));
      if (isViewSetAndInvalid) {
        throw new Error('The registered view is not a Backbone.View or Function');
      }

      this.store[name] = Object.assign({}, this.store[name], object);

      return object;
    }

    /**
     * Parses a view class name.
     * @param {string|Backbone.Model|Backbone.View|object} nameModelViewOrData The name of the view class you want to fetch e.g. `"hotgraphic"` or its model or its json data
     */
    getViewName(nameModelViewOrData) {
      if (typeof nameModelViewOrData === 'string') {
        return nameModelViewOrData;
      }
      if (nameModelViewOrData instanceof Backbone.Model) {
        nameModelViewOrData = nameModelViewOrData.toJSON();
      }
      if (nameModelViewOrData instanceof Backbone.View) {
        let foundName;
        _.find(this.store, (entry, name) => {
          if (!entry || !entry.view) return;
          if (!(nameModelViewOrData instanceof entry.view)) return;
          foundName = name;
          return true;
        });
        return foundName;
      }
      if (nameModelViewOrData instanceof Object) {
        const names = [
          typeof nameModelViewOrData._view === 'string' && nameModelViewOrData._view,
          typeof nameModelViewOrData._component === 'string' && nameModelViewOrData._component,
          typeof nameModelViewOrData._type === 'string' && nameModelViewOrData._type
        ].filter(Boolean);
        if (names.length) {
          // find first fitting view name
          const name = names.find(name => this.store[name] && this.store[name].view);
          return name || names.pop(); // return last available if none found
        }
      }
      throw new Error('Cannot derive view class name from input');
    }

    /**
     * Fetches a view class from the store. For a usage example, see either HotGraphic or Narrative
     * @param {string|Backbone.Model|Backbone.View|object} nameModelViewOrData The name of the view class you want to fetch e.g. `"hotgraphic"` or its model or its json data
     * @returns {Backbone.View} Reference to the view class
     */
    getViewClass(nameModelViewOrData) {
      const name = this.getViewName(nameModelViewOrData);
      const object = this.store[name];
      if (!object) {
        this.log.warnOnce(`A view for '${name}' isn't registered in your project`);
        return;
      }
      const isBackboneView = (object.view && object.view.prototype instanceof Backbone.View);
      if (!isBackboneView && object.view instanceof Function) {
        return object.view();
      }
      return object.view;
    }

    /**
     * Parses a model class name.
     * @param {string|Backbone.Model|object} name The name of the model you want to fetch e.g. `"hotgraphic"`, the model to process or its json data
     */
    getModelName(nameModelOrData) {
      if (typeof nameModelOrData === 'string') {
        return nameModelOrData;
      }
      if (nameModelOrData instanceof Backbone.Model) {
        nameModelOrData = nameModelOrData.toJSON();
      }
      if (nameModelOrData instanceof Object) {
        const names = [
          typeof nameModelOrData._model === 'string' && nameModelOrData._model,
          typeof nameModelOrData._component === 'string' && nameModelOrData._component,
          typeof nameModelOrData._type === 'string' && nameModelOrData._type
        ].filter(Boolean);
        if (names.length) {
          // find first fitting model name
          const name = names.find(name => this.store[name] && this.store[name].model);
          return name || names.pop(); // return last available if none found
        }
      }
      throw new Error('Cannot derive model class name from input');
    }

    /**
     * Fetches a model class from the store. For a usage example, see either HotGraphic or Narrative
     * @param {string|Backbone.Model|object} name The name of the model you want to fetch e.g. `"hotgraphic"` or its json data
     * @returns {Backbone.Model} Reference to the view class
     */
    getModelClass(nameModelOrData) {
      const name = this.getModelName(nameModelOrData);
      const object = this.store[name];
      if (!object) {
        this.log.warnOnce(`A model for '${name}' isn't registered in your project`);
        return;
      }
      const isBackboneModel = (object.model && object.model.prototype instanceof Backbone.Model);
      if (!isBackboneModel && object.model instanceof Function) {
        return object.model();
      }
      return object.model;
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
      const splitIndex = relativeString.search(/[ +\-\d]{1}/);
      const type = relativeString.slice(0, splitIndex).replace(/^@/, '');
      const offset = parseInt(relativeString.slice(splitIndex).trim() || 0);
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
      if (disableAnimationArray) {
        for (let i = 0, l = disableAnimationArray.length; i < l; i++) {
          if (!$('html').is(disableAnimationArray[i])) continue;
          this.config.set('_disableAnimation', true);
          $('html').addClass('disable-animation');
          console.log('Animation disabled.');
        }
        return;
      }

      $('html').toggleClass('disable-animation', (disableAnimation === true));
    }

    async remove() {
      const currentView = this.parentView;
      if (currentView) {
        currentView.model.setOnChildren('_isReady', false);
        currentView.model.set('_isReady', false);
      }
      this.trigger('preRemove', currentView);
      await this.wait.queue();
      // Facilitate contentObject transitions
      if (currentView && this.get('_shouldDestroyContentObjects')) {
        currentView.destroy();
      }
      this.trigger('remove', currentView);
      _.defer(this.trigger.bind(this), 'postRemove', currentView);
    }

  }

  return new Adapt();
});
