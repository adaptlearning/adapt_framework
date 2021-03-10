import Adapt from 'core/js/adapt';
import RouterModel from 'core/js/models/routerModel';
import CourseModel from 'core/js/models/courseModel';
import ContentObjectModel from 'core/js/models/contentObjectModel';
import MenuModel from 'core/js/models/menuModel';
import 'core/js/startController';

class Router extends Backbone.Router {

  routes() {
    return {
      '': 'handleRoute',
      'id/:id': 'handleRoute',
      ':pluginName(/*location)(/*action)': 'handleRoute'
    };
  }

  initialize({ model }) {
    this._isBackward = false;
    this.model = model;
    this._navigationRoot = null;
    // Flag to indicate if the router has tried to redirect to the current location.
    this._isCircularNavigationInProgress = false;
    this.showLoading();
    // Store #wrapper element and html to cache for later use.
    this.$wrapper = $('#wrapper');
    this.$html = $('html');
    this.listenToOnce(Adapt, 'app:dataReady', this.setDocumentTitle);
    this.listenTo(Adapt, 'router:navigateTo', this.navigateToArguments);
  }

  get rootModel() {
    return this._navigationRoot || Adapt.course;
  }

  set rootModel(model) {
    this._navigationRoot = model;
  }

  showLoading() {
    $('.js-loading').show();
  }

  hideLoading() {
    $('.js-loading').hide();
  }

  setDocumentTitle() {
    const currentModel = Adapt.location._currentModel;
    const hasSubTitle = (currentModel && currentModel !== Adapt.router.rootModel && currentModel.get('title'));
    const title = [
      this.rootModel.get('title'),
      hasSubTitle && currentModel.get('title')
    ].filter(Boolean).join(' | ');
    this.listenToOnce(Adapt, 'contentObjectView:preRender', () => {
      const escapedTitle = $(`<div>${title}</div>`).text();
      document.title = escapedTitle;
    });
  }

  navigateToArguments(args) {
    args = args.filter(v => v !== null);
    const options = { trigger: false, replace: false };
    if (args.length === 1 && Adapt.findById(args[0])) {
      this.navigate('#/id/' + args[0], options);
      return;
    }
    if (args.length <= 3) {
      this.navigate('#/' + args.join('/'), options);
      return;
    }
    Adapt.log.deprecated(`Use Backbone.history.navigate or window.location.href instead of Adapt.trigger('router:navigateTo')`);
    this.handleRoute(...args);
  }

  handleRoute(...args) {
    args = args.filter(v => v !== null);

    if (this.model.get('_canNavigate')) {
      // Reset _isCircularNavigationInProgress protection as code is allowed to navigate away.
      this._isCircularNavigationInProgress = false;
    }

    // Check if the current page is in the process of navigating to itself.
    // It will redirect to itself if the URL was changed and _canNavigate is false.
    if (this._isCircularNavigationInProgress === false) {
      // Trigger an event pre 'router:location' to allow extensions to stop routing.
      Adapt.trigger('router:navigate', args);
    }

    // Re-check as _canNavigate can be set to false on 'router:navigate' event.
    if (this.model.get('_canNavigate')) {
      // Disable navigation whilst rendering.
      this.model.set('_canNavigate', false, { pluginName: 'adapt' });
      this._isBackward = false;
      if (args.length <= 1) {
        return this.handleId(...args);
      }
      return this.handlePluginRouter(...args);
    }

    if (this._isCircularNavigationInProgress) {
      // Navigation correction finished.
      // Router has successfully re-navigated to the current _id as the URL was changed
      // while _canNavigate: false
      this._isCircularNavigationInProgress = false;
      return;
    }

    // Cancel navigation to stay at the current location.
    this._isCircularNavigationInProgress = true;
    Adapt.trigger('router:navigationCancelled', args);

    // Reset URL to the current one.
    // https://github.com/adaptlearning/adapt_framework/issues/3061
    Backbone.history.history[this._isBackward ? 'forward' : 'back']();
    this._isBackward = false;
  }

  async handlePluginRouter(pluginName, location, action) {
    const pluginLocation = [
      pluginName,
      location && `-${location}`,
      action && `-${action}`
    ].filter(Boolean).join('');
    await this.updateLocation(pluginLocation, null, null, null);

    Adapt.trigger('router:plugin:' + pluginName, pluginName, location, action);
    Adapt.trigger('router:plugin', pluginName, location, action);
    this.model.set('_canNavigate', true, { pluginName: 'adapt' });
  }

  async handleId(id) {
    const rootModel = Adapt.router.rootModel;
    let model = (!id) ? rootModel : Adapt.findById(id);

    if (!model) {
      // Bad id
      this.model.set('_canNavigate', true, { pluginName: 'adapt' });
      return;
    }

    // Keep the routed id incase it needs to be scrolled to later
    const isContentObject = (model instanceof ContentObjectModel);
    const navigateToId = model.get('_id');

    // Ensure that the router is rendering a contentobject
    model = isContentObject ? model : model.findAncestor('contentobject');
    id = model.get('_id');

    const isRoot = (model === rootModel);
    if (isRoot && Adapt.course.has('_start')) {
      // Do not allow access to the menu when the start controller is enabled.
      const startController = Adapt.course.get('_start');
      if (startController._isEnabled === true && startController._isMenuDisabled === true) {
        return;
      }
    }

    if (model.get('_isLocked') && Adapt.config.get('_forceRouteLocking')) {
      // Locked id
      Adapt.log.warn('Unable to navigate to locked id: ' + id);
      this.model.set('_canNavigate', true, { pluginName: 'adapt' });
      if (Adapt.location._previousId === undefined) {
        return this.navigate('#/', { trigger: true, replace: true });
      }
      return this.navigateBack();
    }

    // Move to a content object
    this.showLoading();
    await Adapt.remove();

    /**
     * TODO:
     * As the course object has separate location and type rules,
     * it makes it more difficult to update the Adapt.location object
     * should stop doing this.
     */
    const isCourse = (model instanceof CourseModel);
    const type = isCourse ? 'menu' : model.get('_type');
    const location = isCourse ? 'course' : `${type}-${id}`;

    model.set('_isVisited', true);
    await this.updateLocation(location, type, id, model);

    Adapt.once('contentObjectView:ready', () => {
      // Allow navigation.
      this.model.set('_canNavigate', true, { pluginName: 'adapt' });
      this.handleNavigationFocus();
    });
    Adapt.trigger(`router:${type} router:contentObject`, model);

    const ViewClass = Adapt.getViewClass(model);
    const isMenu = (model instanceof MenuModel);
    if (!ViewClass && isMenu) {
      Adapt.log.deprecated(`Using event based menu view instantiation for '${Adapt.getViewName(model)}'`);
      return;
    }

    if (!isMenu) {
      // checkIfResetOnRevisit where exists on descendant models before render
      _.invoke(model.getAllDescendantModels(), 'checkIfResetOnRevisit');
      // wait for completion to settle
      await Adapt.deferUntilCompletionChecked();
    }

    this.$wrapper.append(new ViewClass({ model }).$el);

    if (!isContentObject && !this.isScrolling) {
      // Scroll to element if not a content object or not already trying to
      await Adapt.navigateToElement('.' + navigateToId, { replace: true, duration: 400 });
    }

  }

  async updateLocation(currentLocation, type, id, currentModel) {
    // Handles updating the location.
    Adapt.location._previousModel = Adapt.location._currentModel;
    Adapt.location._previousId = Adapt.location._currentId;
    Adapt.location._previousContentType = Adapt.location._contentType;

    Adapt.location._currentModel = currentModel;
    Adapt.location._currentId = id;
    Adapt.location._contentType = type;
    Adapt.location._currentLocation = currentLocation;

    /**
     * TODO:
     * this if block should be removed,
     * these properties are unused in the framework
     */
    if (type === 'menu') {
      Adapt.location._lastVisitedType = 'menu';
      Adapt.location._lastVisitedMenu = id;
    } else if (type === 'page') {
      Adapt.location._lastVisitedType = 'page';
      Adapt.location._lastVisitedPage = id;
    }

    this.setDocumentTitle();
    this.setGlobalClasses();

    // Trigger event when location changes.
    Adapt.trigger('router:location', Adapt.location);

    await Adapt.wait.queue();
  }

  setGlobalClasses() {
    const currentModel = Adapt.location._currentModel;

    const htmlClasses = currentModel?.get('_htmlClasses') || '';
    const classes = (Adapt.location._currentId) ?
      `location-${Adapt.location._contentType} location-id-${Adapt.location._currentId}` :
      `location-${Adapt.location._currentLocation}`;
    const currentClasses = `${classes} ${htmlClasses}`;

    this.$html
      .removeClass(Adapt.location._previousClasses)
      .addClass(currentClasses)
      .attr('data-location', Adapt.location._currentLocation);

    this.$wrapper
      .removeClass()
      .addClass(classes)
      .attr('data-location', Adapt.location._currentLocation);

    Adapt.location._previousClasses = currentClasses;
  }

  handleNavigationFocus() {
    if (!this.model.get('_shouldNavigateFocus')) return;
    // Body will be forced to accept focus to start the
    // screen reader reading the page.
    Adapt.a11y.focus('body');
  }

  navigateBack() {
    this._isBackward = true;
    Backbone.history.history.back();
  }

  navigateToCurrentRoute(force) {
    if (!this.model.get('_canNavigate') && !force) {
      return;
    }
    if (!Adapt.location._currentId) {
      return;
    }
    const currentId = Adapt.location._currentModel.get('_id');
    const isRoot = (Adapt.location._currentModel === this.rootModel);
    const route = isRoot ? '#/' : '#/id/' + currentId;
    this.navigate(route, { trigger: true, replace: true });
  }

  navigateToPreviousRoute(force) {
    // Sometimes a plugin might want to stop the default navigation.
    // Check whether default navigation has changed.
    if (!this.model.get('_canNavigate') && !force) {
      return;
    }
    const currentModel = Adapt.location._currentModel;
    const previousModel = Adapt.location._previousModel;
    if (!currentModel) {
      return this.navigateBack();
    }
    if (Adapt.location._currentModel instanceof MenuModel) {
      return this.navigateToParent();
    }
    if (previousModel) {
      return this.navigateBack();
    }
    this.navigateToParent();
  }

  navigateToParent(force) {
    if (!this.model.get('_canNavigate') && !force) {
      return;
    }
    const parentId = Adapt.location._currentModel.get('_parentId');
    const parentModel = Adapt.findById(parentId);
    const isRoot = (parentModel === this.rootModel);
    const route = isRoot ? '#/' : '#/id/' + parentId;
    this.navigate(route, { trigger: true });
  }

  navigateToHomeRoute(force) {
    if (!this.model.get('_canNavigate') && !force) {
      return;
    }
    this.navigate('#/', { trigger: true });
  }

  /**
   * Allows a selector or id to be passed in and Adapt will navigate to this element. Resolves
   * asynchronously when the element has been navigated to.
   * Backend for Adapt.navigateToElement
   * @param {string} selector CSS selector or id of the Adapt element you want to navigate to e.g. `".co-05"` or `"co-05"`
   * @param {Object} [settings] The settings for the `$.scrollTo` function (See https://github.com/flesler/jquery.scrollTo#settings).
   * @param {Object} [settings.replace=false] Set to `true` if you want to update the URL without creating an entry in the browser's history.
   */
  async navigateToElement(selector, settings = {}) {
    const currentModelId = selector.replace(/\./g, '').split(' ')[0];
    const currentModel = Adapt.findById(currentModelId);

    if (currentModel && (!currentModel.get('_isRendered') || !currentModel.get('_isReady'))) {
      const shouldReplace = settings.replace || false;
      const contentObject = (currentModel instanceof ContentObjectModel) ? currentModel : currentModel.findAncestor('contentobject');
      const contentObjectId = contentObject.get('_id');
      const isInCurrentContentObject = (contentObjectId !== Adapt.location._currentId);
      if (isInCurrentContentObject) {
        this.isScrolling = true;
        this.navigate(`#/id/${currentModelId}`, { trigger: true, replace: shouldReplace });
        this.model.set('_shouldNavigateFocus', false, { pluginName: 'adapt' });
        await new Promise(resolve => Adapt.once('contentObjectView:ready', _.debounce(() => {
          this.model.set('_shouldNavigateFocus', true, { pluginName: 'adapt' });
          resolve();
        }, 1)));
        this.isScrolling = false;
      }
      await Adapt.parentView.renderTo(currentModelId);
    }

    // Correct selector when passed a pure id
    if (currentModel && selector === currentModel.get('_id')) {
      selector = `.${selector}`;
    }

    // Get the current location - this is set in the router
    const location = (Adapt.location._contentType) ?
      Adapt.location._contentType : Adapt.location._currentLocation;
    // Trigger initial scrollTo event
    Adapt.trigger(`${location}:scrollTo`, selector);
    // Setup duration variable
    const disableScrollToAnimation = Adapt.config.has('_disableAnimation') ? Adapt.config.get('_disableAnimation') : false;
    if (disableScrollToAnimation) {
      settings.duration = 0;
    } else if (!settings.duration) {
      settings.duration = $.scrollTo.defaults.duration;
    }

    let offsetTop = 0;
    if (Adapt.scrolling.isLegacyScrolling) {
      offsetTop = -$('.nav').outerHeight();
      // prevent scroll issue when component description aria-label coincident with top of component
      if ($(selector).hasClass('component')) {
        offsetTop -= $(selector).find('.aria-label').height() || 0;
      }
    }

    if (!settings.offset) settings.offset = { top: offsetTop, left: 0 };
    if (settings.offset.top === undefined) settings.offset.top = offsetTop;
    if (settings.offset.left === undefined) settings.offset.left = 0;

    if (settings.offset.left === 0) settings.axis = 'y';

    if (Adapt.get('_canScroll') !== false) {
      // Trigger scrollTo plugin
      $.scrollTo(selector, settings);
    }

    // Trigger an event after animation
    // 300 milliseconds added to make sure queue has finished
    await new Promise(resolve => {
      _.delay(() => {
        Adapt.a11y.focusNext(selector);
        Adapt.trigger(`${location}:scrolledTo`, selector);
        resolve();
      }, settings.duration + 300);
    });
  }

  get(...args) {
    Adapt.log.deprecated('Adapt.router.get, please use Adapt.router.model.get');
    return this.model.get(...args);
  }

  set(...args) {
    Adapt.log.deprecated('Adapt.router.set, please use Adapt.router.model.set');
    return this.model.set(...args);
  }

}

Adapt.router = new Router({
  model: new RouterModel(null, { reset: true })
});

Adapt.navigateToElement = Adapt.router.navigateToElement.bind(Adapt.router);

export default Adapt.router;
