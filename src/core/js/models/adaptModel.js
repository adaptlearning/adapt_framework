define([
  'core/js/adapt',
  'core/js/modelEvent',
  'core/js/logging'
], function (Adapt, ModelEvent) {

  class AdaptModel extends Backbone.Model {

    toJSON() {
      // Perform shallow clone
      const json = _.clone(this.attributes);
      // Remove deprecated values as they are not true json
      delete json._children;
      delete json._parent;
      // Perform deep clone
      return $.extend(true, {}, json);
    }

    get(name) {
      switch (name) {
        case '_parent':
        case '_children':
          Adapt.log.deprecated(`Use model.getChildren() or model.getParent() instead of model.get('_children') or model.get('_parent')`);
      }
      return super.get(name);
    }

    defaults() {
      return {
        _canShowFeedback: true,
        _classes: '',
        _canReset: false,
        _canRequestChild: false,
        _isComplete: false,
        _isInteractionComplete: false,
        _isA11yRegionEnabled: false,
        _isA11yCompletionDescriptionEnabled: true,
        _requireCompletionOf: -1,
        _isEnabled: true,
        _isResetOnRevisit: false,
        _isAvailable: true,
        _isOptional: false,
        _isRendered: false,
        _isReady: false,
        _isVisible: true,
        _isLocked: false,
        _isHidden: false
      };
    }

    trackable() {
      return [
        '_id',
        '_isComplete',
        '_isInteractionComplete'
      ];
    }

    trackableType() {
      return [
        String,
        Boolean,
        Boolean
      ];
    }

    bubblingEvents() {
      return [
        'change:_isComplete',
        'change:_isInteractionComplete',
        'change:_isActive'
      ];
    }

    setupModel() {
      if (this.hasManagedChildren) {
        this.setupChildListeners();
      }

      this.init();

      _.defer(() => {
        if (this.hasManagedChildren) {
          this.checkCompletionStatus();

          this.checkInteractionCompletionStatus();

          this.checkLocking();
        }

        this.setupTrackables();

      });

    }

    setupTrackables() {

      // Limit state trigger calls and make state change callbacks batched-asynchronous
      const originalTrackableStateFunction = this.triggerTrackableState;
      this.triggerTrackableState = _.compose(
        () => {

          // Flag that the function is awaiting trigger
          this.triggerTrackableState.isQueued = true;

        },
        _.debounce(() => {

          // Trigger original function
          originalTrackableStateFunction.apply(this);

          // Unset waiting flag
          this.triggerTrackableState.isQueued = false;

        }, 17)
      );

      // Listen to model changes, trigger trackable state change when appropriate
      this.listenTo(this, 'change', ({ changed }) => {

        // Skip if trigger queued or adapt hasn't started yet
        if (this.triggerTrackableState.isQueued || !Adapt.attributes._isStarted) {
          return;
        }

        // Check that property is trackable
        const trackablePropertyNames = _.result(this, 'trackable', []);
        const changedPropertyNames = Object.keys(changed);
        const isTrackable = changedPropertyNames.find(item => {
          return trackablePropertyNames.includes(item);
        });

        if (isTrackable) {
          // Trigger trackable state change
          this.triggerTrackableState();
        }
      });
    }

    setupChildListeners() {
      const children = this.getChildren();
      if (!children.length) {
        return;
      }

      this.listenTo(children, {
        'all': this.onAll,
        'bubble': this.bubble,
        'change:_isReady': this.checkReadyStatus,
        'change:_isComplete': this.onIsComplete,
        'change:_isInteractionComplete': this.checkInteractionCompletionStatus
      });
    }

    init() {}

    getTrackableState() {

      const trackable = this.resultExtend('trackable', []);
      const json = this.toJSON();

      const args = trackable;
      args.unshift(json);

      return _.pick(...args);

    }

    setTrackableState(state) {

      const trackable = this.resultExtend('trackable', []);

      const args = trackable;
      args.unshift(state);

      state = _.pick(...args);

      this.set(state);

      return this;

    }

    triggerTrackableState() {

      Adapt.trigger('state:change', this, this.getTrackableState());

    }

    reset(type, force) {
      if (!this.get('_canReset') && !force) return;

      type = type || true;

      switch (type) {
        case 'hard': case true:
          this.set({
            _isEnabled: true,
            _isComplete: false,
            _isInteractionComplete: false
          });
          break;
        case 'soft':
          this.set({
            _isEnabled: true,
            _isInteractionComplete: false
          });
          break;
      }
    }

    /**
     * Checks if any child models which have been _isRendered are not _isReady.
     * If all rendered child models are marked ready then this model will be
     * marked _isReady: true as well.
     * @param {AdaptModel} [model]
     * @param {boolean} [value]
     * @returns {boolean}
     */
    checkReadyStatus(model, value) {
      if (value === false) {
        // Do not respond to _isReady: false as _isReady is unset throughout
        // the rendering process
        return false;
      }
      // Filter children based upon whether they are available
      // Check if any _isRendered: true children return _isReady: false
      // If not - set this model to _isReady: true
      const children = this.getAvailableChildModels();
      if (children.find(child => child.get('_isReady') === false && child.get('_isRendered'))) {
        return false;
      }

      this.set('_isReady', true);
      return true;
    }

    setCompletionStatus() {
      if (!this.get('_isVisible')) return;

      this.set({
        _isComplete: true,
        _isInteractionComplete: true
      });
    }

    checkCompletionStatus() {
      // defer to allow other change:_isComplete handlers to fire before cascading to parent
      Adapt.checkingCompletion();
      _.defer(this.checkCompletionStatusFor.bind(this), '_isComplete');
    }

    checkInteractionCompletionStatus() {
      // defer to allow other change:_isInteractionComplete handlers to fire before cascading to parent
      Adapt.checkingCompletion();
      _.defer(this.checkCompletionStatusFor.bind(this), '_isInteractionComplete');
    }

    /**
     * Function for checking whether the supplied completion attribute should be set to true or false.
     * It iterates over our immediate children, checking the same completion attribute on any mandatory child
     * to see if enough/all of them them have been completed. If enough/all have, we set our attribute to true;
     * if not, we set it to false.
     * @param {string} [completionAttribute] Either '_isComplete' or '_isInteractionComplete'. Defaults to '_isComplete' if not supplied.
     */

    checkCompletionStatusFor(completionAttribute = '_isComplete') {
      let completed = false;
      const children = this.getAvailableChildModels();
      const requireCompletionOf = this.get('_requireCompletionOf');

      if (requireCompletionOf === -1) { // a value of -1 indicates that ALL mandatory children must be completed
        completed = children.every(child => {
          return child.get(completionAttribute) || child.get('_isOptional');
        });
      } else {
        completed = (children.filter(child => {
          return child.get(completionAttribute) && !child.get('_isOptional');
        }).length >= requireCompletionOf);
      }

      this.set(completionAttribute, completed);

      Adapt.checkedCompletion();
    }

    /**
     * Returns a string describing the type group of this model.
     * Strings should be lowercase and not plurlaized.
     * i.e. 'page', 'menu', 'contentobject', 'component', 'article', 'block'
     * Override in inheritance chain.
     * @returns {string}
     */
    getTypeGroup() {}

    /**
     * Returns true if this model is of the type group described.
     * Automatically manages pluralization typeGroup and matches lowercase only.
     * Pluralized typeGroups and uppercase characters in typeGroups are discouraged.
     * @param {string} type Type group name i.e. course, contentobject, article, block, component
     * @returns {boolean}
     */
    isTypeGroup(typeGroup) {
      const hasUpperCase = /[A-Z]+/.test(typeGroup);
      const isPluralized = typeGroup.slice(-1) === 's';
      const lowerCased = typeGroup.toLowerCase();
      const singular = isPluralized && lowerCased.slice(0, -1); // remove pluralization if ending in s
      const singularLowerCased = (singular || lowerCased).toLowerCase();
      if (isPluralized || hasUpperCase) {
        Adapt.log.deprecated(`'${typeGroup}' appears pluralized or contains uppercase characters, suggest using the singular, lowercase type group '${singularLowerCased}'.`);
      }
      const pluralizedLowerCaseTypes = [
        singularLowerCased,
        !isPluralized && `${lowerCased}s` // pluralize if not ending in s
      ].filter(Boolean);
      const typeGroups = this.getTypeGroups();
      if (_.intersection(pluralizedLowerCaseTypes, typeGroups).length) {
        return true;
      }
      return false;
    }

    /**
     * Returns an array of strings describing the model type groups.
     * All strings are lowercase and should not be pluralized.
     * i.e. ['course', 'menu', 'contentobject'], ['page', 'contentobject'], ['component']
     * @returns {[string]}
     */
    getTypeGroups() {
      if (this._typeGroups) return this._typeGroups;
      const typeGroups = [ this.get('_type') ];
      let parentClass = this;
      while ((parentClass = Object.getPrototypeOf(parentClass))) {
        if (!parentClass.hasOwnProperty('getTypeGroup')) continue;
        typeGroups.push(parentClass.getTypeGroup.call(this));
      }
      return (this._typeGroups = _.uniq(typeGroups.filter(Boolean).map(s => s.toLowerCase())));
    }

    /**
     * Searches the model's ancestors to find the first instance of the specified ancestor type
     * @param {string} [ancestorType] Valid values are 'course', 'pages', 'contentObjects', 'articles' or 'blocks'.
     * If left blank, the immediate ancestor (if there is one) is returned
     * @return {object} Reference to the model of the first ancestor of the specified type that's found - or `undefined` if none found
     */
    findAncestor(ancestorType) {
      const parent = this.getParent();
      if (!parent) return;
      if (!ancestorType || parent.isTypeGroup(ancestorType)) {
        return parent;
      }
      return parent.findAncestor(ancestorType);
    }

    /**
     * Returns all the descendant models of a specific type
     * @param {string} descendants Valid values are 'contentobject', 'page', 'menu', 'article', 'block', 'component', 'question'
     * @param {object} options an object that defines the search type and the properties/values to search on. Currently only the `where` search type (equivalent to `Backbone.Collection.where()`) is supported.
     * @param {object} options.where
     * @return {array}
     * @example
     * //find all available, non-optional components
     * this.findDescendantModels('component', { where: { _isAvailable: true, _isOptional: false }});
     */
    findDescendantModels(descendants, options) {
      const allDescendantsModels = this.getAllDescendantModels();
      const returnedDescendants = allDescendantsModels.filter(model => {
        return model.isTypeGroup(descendants);
      });

      if (!options) {
        return returnedDescendants;
      }

      if (options.where) {
        return returnedDescendants.filter(descendant => {
          for (let property in options.where) {
            const value = options.where[property];
            if (descendant.get(property) !== value) {
              return false;
            }
          }
          return true;
        });
      }
    }

    /**
     * Fetches the sub structure of a model as a flattened array
     *
     * Such that the tree:
     *  { a1: { b1: [ c1, c2 ], b2: [ c3, c4 ] }, a2: { b3: [ c5, c6 ] } }
     *
     * will become the array (parent first = false):
     *  [ c1, c2, b1, c3, c4, b2, a1, c5, c6, b3, a2 ]
     *
     * or (parent first = true):
     *  [ a1, b1, c1, c2, b2, c3, c4, a2, b3, c5, c6 ]
     *
     * This is useful when sequential operations are performed on the menu/page/article/block/component hierarchy.
     * @param {boolean} [isParentFirst]
     * @return {array}
     */
    getAllDescendantModels(isParentFirst) {

      const descendants = [];

      if (!this.hasManagedChildren) {
        return descendants;
      }

      const children = this.getChildren();

      children.models.forEach(child => {

        if (!child.hasManagedChildren) {
          descendants.push(child);
          return;
        }

        const subDescendants = child.getAllDescendantModels(isParentFirst);
        if (isParentFirst === true) {
          descendants.push(child);
        }

        descendants.push(...subDescendants);

        if (isParentFirst !== true) {
          descendants.push(child);
        }
      });

      return descendants;

    }

    /**
     * Returns a relative model from the Adapt hierarchy
     *
     * Such that in the tree:
     *  { a1: { b1: [ c1, c2 ], b2: [ c3, c4 ] }, a2: { b3: [ c5, c6 ] } }
     *
     *  c1.findRelativeModel('@block +1') = b2;
     *  c1.findRelativeModel('@component +4') = c5;
     *
     * @see Adapt.parseRelativeString for a description of relativeStrings
     * @param {string} relativeString
     * @param {object} options Search configuration settings
     * @param {boolean} options.limitParentId
     * @param {function} options.filter
     * @param {boolean} options.loop
     * @return {array}
     */
    findRelativeModel(relativeString, options = {}) {
      // return a model relative to the specified one if opinionated
      const rootModel = options.limitParentId ?
        Adapt.findById(options.limitParentId) :
        Adapt.course;

      const relativeDescriptor = Adapt.parseRelativeString(relativeString);
      const searchBackwards = (relativeDescriptor.offset < 0);
      let moveBy = Math.abs(relativeDescriptor.offset);
      let movementCount = 0;

      const hasDescendantsOfType = Boolean(this.findDescendantModels(relativeDescriptor.type).length);
      if (hasDescendantsOfType) {
        // move by one less as first found is considered next
        // will find descendants on either side but not inside
        moveBy--;
      }

      let pageDescendants;
      if (searchBackwards) {
        // parents first [p1,a1,b1,c1,c2,a2,b2,c3,c4,p2,a3,b3,c6,c7,a4,b4,c8,c9]
        pageDescendants = [rootModel];
        pageDescendants.push(...rootModel.getAllDescendantModels(true));

        // reverse so that we don't need a forward and a backward iterating loop
        // reversed [c9,c8,b4,a4,c7,c6,b3,a3,p2,c4,c3,b2,a2,c2,c1,b1,a1,p1]
        pageDescendants.reverse();
      } else {
        // children first [c1,c2,b1,a1,c3,c4,b2,a2,p1,c6,c7,b3,a3,c8,c9,b4,a4,p2]
        pageDescendants = rootModel.getAllDescendantModels(false);
        pageDescendants.push(rootModel);
      }

      // filter if opinionated
      if (typeof options.filter === 'function') {
        pageDescendants = pageDescendants.filter(options.filter);
      }

      // find current index in array
      const modelId = this.get('_id');
      const modelIndex = pageDescendants.findIndex(pageDescendant => {
        if (pageDescendant.get('_id') === modelId) {
          return true;
        }
        return false;
      });

      if (options.loop) {
        // normalize offset position to allow for overflow looping
        const totalOfType = pageDescendants.reduce((count, model) => {
          if (!model.isTypeGroup(relativeDescriptor.type)) return count;
          return ++count;
        }, 0);
        // take the remainder after removing whole units of the type count
        moveBy = moveBy % totalOfType;
        // double up entries to allow for overflow looping
        pageDescendants = pageDescendants.concat(pageDescendants.slice(0));
      }

      for (let i = modelIndex, l = pageDescendants.length; i < l; i++) {
        const descendant = pageDescendants[i];
        if (descendant.isTypeGroup(relativeDescriptor.type)) {
          if (movementCount > moveBy) {
            // there is no descendant which matches this relativeString
            // probably looking for the descendant 0 in a parent
            break;
          }
          if (movementCount === moveBy) {
            return Adapt.findById(descendant.get('_id'));
          }
          movementCount++;
        }
      }

    }

    get hasManagedChildren() {
      return true;
    }

    getChildren() {
      if (this._childrenCollection) {
        return this._childrenCollection;
      }

      let childrenCollection;

      if (!this.hasManagedChildren) {
        childrenCollection = new Backbone.Collection();
      } else {
        const id = this.get('_id');
        // Look up child by _parentId from Adapt.data
        const children = Adapt.data.filter(model => model.get('_parentId') === id);
        childrenCollection = new Backbone.Collection(children);
      }

      if (this.get('_type') === 'block' &&
        childrenCollection.length === 2 &&
        childrenCollection.models[0].get('_layout') !== 'left') {
        // Components may have a 'left' or 'right' _layout,
        // so ensure they appear in the correct order
        // Re-order component models to correct it
        childrenCollection.comparator = '_layout';
        childrenCollection.sort();
      }

      this.setChildren(childrenCollection);
      return this._childrenCollection;
    }

    setChildren(children) {
      this._childrenCollection = children;
      // Setup deprecated reference
      this.set('_children', children);
    }

    getAvailableChildModels() {
      return this.getChildren().where({
        _isAvailable: true
      });
    }

    getParent() {
      if (this._parentModel) {
        return this._parentModel;
      }
      const parentId = this.get('_parentId');
      if (!parentId) return;
      // Look up parent by id from Adapt.data
      this.setParent(Adapt.findById(parentId));
      return this._parentModel;
    }

    setParent(parent) {
      this._parentModel = parent;
      this.set('_parentId', this._parentModel.get('_id'));
      // Set up deprecated reference
      this.set('_parent', this._parentModel);
    }

    getAncestorModels(shouldIncludeChild) {
      const parents = [];
      let context = this;

      if (shouldIncludeChild) parents.push(context);

      while (context.has('_parentId')) {
        context = context.getParent();
        parents.push(context);
      }

      return parents.length ? parents : null;
    }

    getSiblings(passSiblingsAndIncludeSelf) {
      const id = this.get('_id');
      const parentId = this.get('_parentId');
      let siblings;
      if (!passSiblingsAndIncludeSelf) {
        // returns a collection of siblings excluding self
        if (this._hasSiblingsAndSelf === false) {
          return this.get('_siblings');
        }
        siblings = Adapt.data.filter(model => {
          return model.get('_parentId') === parentId &&
            model.get('_id') !== id;
        });

        this._hasSiblingsAndSelf = false;

      } else {
        // returns a collection of siblings including self
        if (this._hasSiblingsAndSelf) {
          return this.get('_siblings');
        }

        siblings = Adapt.data.filter(model => {
          return model.get('_parentId') === parentId;
        });
        this._hasSiblingsAndSelf = true;
      }

      const siblingsCollection = new Backbone.Collection(siblings);
      this.set('_siblings', siblingsCollection);
      return siblingsCollection;
    }

    /**
     * @param  {string} key
     * @param  {any} value
     * @param  {Object} options
     */
    setOnChildren(...args) {

      this.set(...args);

      if (!this.hasManagedChildren) return;

      const children = this.getChildren();
      children.models.forEach(child => child.setOnChildren(...args));

    }

    /**
     * @deprecated since v3.2.3 - please use `model.set('_isOptional', value)` instead
     */
    setOptional(value) {
      Adapt.log.deprecated(`Use model.set('_isOptional', value) as setOptional() may be removed in the future`);
      this.set({ _isOptional: value });
    }

    checkLocking() {
      const lockType = this.get('_lockType');

      if (!lockType) return;

      switch (lockType) {
        case 'sequential':
          this.setSequentialLocking();
          break;
        case 'unlockFirst':
          this.setUnlockFirstLocking();
          break;
        case 'lockLast':
          this.setLockLastLocking();
          break;
        case 'custom':
          this.setCustomLocking();
          break;
        default:
          console.warn(`AdaptModel.checkLocking: unknown _lockType '${lockType}' found on ${this.get('_id')}`);
      }
    }

    setSequentialLocking() {
      const children = this.getAvailableChildModels();

      for (let i = 1, j = children.length; i < j; i++) {
        children[i].set('_isLocked', !children[i - 1].get('_isComplete'));
      }
    }

    setUnlockFirstLocking() {
      const children = this.getAvailableChildModels();
      const isFirstChildComplete = children[0].get('_isComplete');

      for (let i = 1, j = children.length; i < j; i++) {
        children[i].set('_isLocked', !isFirstChildComplete);
      }
    }

    setLockLastLocking() {
      const children = this.getAvailableChildModels();
      const lastIndex = children.length - 1;

      for (let i = lastIndex - 1; i >= 0; i--) {
        if (!children[i].get('_isComplete')) {
          return children[lastIndex].set('_isLocked', true);
        }
      }

      children[lastIndex].set('_isLocked', false);
    }

    setCustomLocking() {
      const children = this.getAvailableChildModels();
      children.forEach(child => {
        child.set('_isLocked', this.shouldLock(child));
      });
    }

    shouldLock(child) {
      const lockedBy = child.get('_lockedBy');

      if (!lockedBy) return false;

      for (let i = lockedBy.length - 1; i >= 0; i--) {
        const id = lockedBy[i];

        try {
          const model = Adapt.findById(id);

          if (!model.get('_isAvailable')) continue;
          if (!model.get('_isComplete')) return true;
        } catch (e) {
          console.warn(`AdaptModel.shouldLock: unknown _lockedBy ID '${id}' found on ${child.get('_id')}`);
        }
      }

      return false;
    }

    onIsComplete() {
      this.checkCompletionStatus();

      this.checkLocking();
    }

    /**
     * Used before a model is rendered to determine if it should be reset to its
     * default values.
     */
    checkIfResetOnRevisit() {
      var isResetOnRevisit = this.get('_isResetOnRevisit');
      if (!isResetOnRevisit) {
        return;
      }
      // If reset is enabled set defaults
      this.reset(isResetOnRevisit);
    }

    /**
     * Clones this model and all managed children returning a new branch.
     * Assign new unique ids to each cloned model.
     * @param {Function} [modifier] A callback function for each child to allow for custom modifications
     * @returns {AdaptModel}
     */
    deepClone(modifier = null) {
      // Fetch the class
      const ModelClass = this.constructor;
      // Clone the model
      const clonedModel = new ModelClass(this.toJSON());
      // Run the custom modifier on the clone
      if (modifier) {
        modifier(clonedModel, this);
      }
      let clonedId = clonedModel.get('_id');
      const hasId = Boolean(clonedId);
      const shouldAssignUniqueId = (this.get('_id') === clonedId);
      if (hasId && shouldAssignUniqueId) {
        // Create a unique id if none was set by the modifier
        const cid = _.uniqueId(ModelClass.prototype.cidPrefix || 'c');
        clonedId = `${clonedId}_${cid}`;
        clonedModel.set('_id', clonedId);
      }
      // Add the cloned model to Adapt.data for Adapt.findById resolution
      if (hasId) {
        Adapt.data.add(clonedModel);
      }
      // Clone any children
      if (this.hasManagedChildren) {
        this.getChildren().each(child => {
          if (!child.deepClone) {
            throw new Error('Cannot deepClone child.');
          }
          child.deepClone((clone, child) => {
            if (hasId) {
              // Set the cloned child parent id
              clone.set('_parentId', clonedId);
            }
            if (modifier) {
              // Run the custom modifier function on the cloned child
              modifier(clone, child);
            }
          });
        });
      }
      // Add the cloned model to its parent for model.findDescendants resolution
      clonedModel.getParent().getChildren().add(clonedModel);
      // Setup the cloned model after setting the id, the parent and adding any children
      clonedModel.setupModel();
      return clonedModel;
    }

    /**
     * Internal event handler for all module events. Triggers event bubbling
     * through the module hierarchy when the event is included in
     * `this.bubblingEvents`.
     * @param {string} type Event name / type
     * @param {Backbone.Model} model Origin backbone model
     * @param {*} value New property value
     */
    onAll(type, model, value) {
      if (!_.result(this, 'bubblingEvents').includes(type)) return;
      const event = new ModelEvent(type, model, value);
      this.bubble(event);
    }

    /**
     * Internal event handler for bubbling events.
     * @param {ModelEvent} event
     */
    bubble(event) {
      if (!event.canBubble) return;
      event.addPath(this);
      this.trigger(`bubble:${event.type} bubble`, event);
    }

  }

  return AdaptModel;

});
