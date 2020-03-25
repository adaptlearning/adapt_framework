define([
  'core/js/adapt',
  'core/js/models/routerModel',
  'core/js/views/pageView',
  'core/js/startController'
], function(Adapt, RouterModel, PageView) {

  class Router extends Backbone.Router {

    initialize({ model }) {

      this.model = model;

      // Flag to indicate if the router has tried to redirect to the current location.
      this._isCircularNavigationInProgress = false;

      this.showLoading();

      // Store #wrapper element and html to cache for later use.
      this.$wrapper = $('#wrapper');
      this.$html = $('html');

      this.listenToOnce(Adapt, 'app:dataReady', () => {
        document.title = Adapt.course.get('title');
      });

      this.listenTo(Adapt, {
        'router:navigateTo': this.navigateToArguments
      });
    }

    routes() {
      return {
        '': 'handleRoute',
        'id/:id': 'handleRoute',
        ':pluginName(/*location)(/*action)': 'handleRoute'
      };
    }

    pruneArguments(args) {
      if (args.length !== 0) {
        // Remove any null arguments.
        args = args.filter(v => v !== null);
      }

      return args;
    }

    handleRoute(...args) {
      args = this.pruneArguments(args);

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

        switch (args.length) {
          case 1:
            // If only one parameter assume it's the ID.
            return this.handleId(...args);
          case 2:
            // If there are two parameters assume it's a plugin.
            return this.handlePluginRouter(...args);
          default:
            // Route to course home page.
            return this.handleCourse();
        }
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
      this.navigateToCurrentRoute(true);
    }

    handlePluginRouter(pluginName, location, action) {
      var pluginLocation = pluginName;

      if (location) {
        pluginLocation = pluginLocation + '-' + location;

        if (action) {
          pluginLocation = pluginLocation + '-' + action;
        }
      }

      this.updateLocation(pluginLocation, null, null, () => {
        Adapt.trigger('router:plugin:' + pluginName, pluginName, location, action);
        Adapt.trigger('router:plugin', pluginName, location, action);

        this.model.set('_canNavigate', true, { pluginName: 'adapt' });
      });
    }

    handleCourse() {
      if (Adapt.course.has('_start')) {
        // Do not allow access to the menu when the start controller is enabled.
        var startController = Adapt.course.get('_start');

        if (startController._isEnabled === true && startController._isMenuDisabled === true) {
          return;
        }
      }

      this.showLoading();

      this.removeViews(() => {
        Adapt.course.set('_isReady', false);

        this.setContentObjectToVisited(Adapt.course);

        this.updateLocation('course', null, null, () => {
          this.listenToOnce(Adapt, 'menuView:ready', () => {
            // Allow navigation.
            this.model.set('_canNavigate', true, { pluginName: 'adapt' });
            this.handleNavigationFocus();
          });

          Adapt.trigger('router:menu', Adapt.course);
        });
      });
    }

    handleId(id) {
      var currentModel = Adapt.findById(id);
      var type = '';

      if (!currentModel) {
        this.model.set('_canNavigate', true, { pluginName: 'adapt' });
        return;
      }

      type = currentModel.get('_type');

      switch (type) {
        case 'page':
        case 'menu':
          if (currentModel.get('_isLocked') && Adapt.config.get('_forceRouteLocking')) {
            Adapt.log.warn('Unable to navigate to locked id: ' + id);
            this.model.set('_canNavigate', true, { pluginName: 'adapt' });
            if (Adapt.location._previousId === undefined) {
              return this.navigate('#/', { trigger: true, replace: true });
            } else {
              return Backbone.history.history.back();
            }
          } else {
            this.showLoading();
            this.removeViews(() => {
              var location;
              this.setContentObjectToVisited(currentModel);

              if (type === 'page') {
                location = 'page-' + id;
                this.updateLocation(location, 'page', id, () => {
                  this.listenToOnce(Adapt, 'pageView:ready', () => {
                    // Allow navigation.
                    this.model.set('_canNavigate', true, { pluginName: 'adapt' });
                    this.handleNavigationFocus();
                  });
                  Adapt.trigger('router:page', currentModel);
                  this.$wrapper.append(new PageView({ model: currentModel }).$el);
                });
              } else {
                location = 'menu-' + id;
                this.updateLocation(location, 'menu', id, () => {
                  this.listenToOnce(Adapt, 'menuView:ready', () => {
                    // Allow navigation.
                    this.model.set('_canNavigate', true, { pluginName: 'adapt' });
                    this.handleNavigationFocus();
                  });
                  Adapt.trigger('router:menu', currentModel);
                });
              }
            });
          }
          break;
        default:
          // Allow navigation.
          this.model.set('_canNavigate', true, { pluginName: 'adapt' });
          Adapt.navigateToElement('.' + id, { replace: true });
      }
    }

    removeViews(onComplete) {
      Adapt.remove();

      Adapt.wait.queue(onComplete);
    }

    showLoading() {
      $('.js-loading').show();
    }

    navigateToArguments(args) {
      args = this.pruneArguments(args);

      var options = { trigger: false, replace: false };

      switch (args.length) {
        case 0:
          this.navigate('#/', options);
          break;
        case 1:
          if (Adapt.findById(args[0])) {
            this.navigate('#/id/' + args[0], options);
          } else {
            this.navigate('#/' + args[0], options);
          }
          break;
        case 2:
        case 3:
          this.navigate('#/' + args.join('/'), options);
          break;
        default:
          Adapt.log.deprecated(`Use Backbone.history.navigate or window.location.href instead of Adapt.trigger('router:navigateTo')`);
          this.handleRoute(...args);
      }
    }

    navigateToPreviousRoute(force) {
      // Sometimes a plugin might want to stop the default navigation.
      // Check whether default navigation has changed.
      if (!this.model.get('_canNavigate') && !force) {
        return;
      }
      if (!Adapt.location._currentId) {
        return Backbone.history.history.back();
      }
      if (Adapt.location._previousContentType === 'page' && Adapt.location._contentType === 'menu') {
        return this.navigateToParent();
      }
      if (Adapt.location._previousContentType === 'page') {
        return Backbone.history.history.back();
      }
      if (Adapt.location._currentLocation === 'course') {
        return;
      }
      this.navigateToParent();
    }

    navigateToHomeRoute(force) {
      if (!this.model.get('_canNavigate') && !force) {
        return;
      }
      this.navigate('#/', { trigger: true });
    }

    navigateToCurrentRoute(force) {
      if (!this.model.get('_canNavigate') && !force) {
        return;
      }
      if (!Adapt.location._currentId) {
        return;
      }
      var currentId = Adapt.location._currentId;
      var route = (currentId === Adapt.course.get('_id')) ? '#/' : '#/id/' + currentId;
      this.navigate(route, { trigger: true, replace: true });
    }

    navigateToParent(force) {
      if (!this.model.get('_canNavigate') && !force) {
        return;
      }
      var parentId = Adapt.contentObjects.findWhere({ _id: Adapt.location._currentId }).get('_parentId');
      var route = (parentId === Adapt.course.get('_id')) ? '#/' : '#/id/' + parentId;
      this.navigate(route, { trigger: true });
    }

    setContentObjectToVisited(model) {
      model.set('_isVisited', true);
    }

    updateLocation(currentLocation, type, id, onComplete) {
      // Handles updating the location.
      Adapt.location._previousId = Adapt.location._currentId;
      Adapt.location._previousContentType = Adapt.location._contentType;

      if (currentLocation === 'course') {
        Adapt.location._currentId = Adapt.course.get('_id');
        Adapt.location._contentType = 'menu';
        Adapt.location._lastVisitedMenu = currentLocation;
      } else if (!type) {
        Adapt.location._currentId = null;
        Adapt.location._contentType = null;
      } else if (_.isString(id)) {
        Adapt.location._currentId = id;
        Adapt.location._contentType = type;

        if (type === 'menu') {
          Adapt.location._lastVisitedType = 'menu';
          Adapt.location._lastVisitedMenu = id;
        } else if (type === 'page') {
          Adapt.location._lastVisitedType = 'page';
          Adapt.location._lastVisitedPage = id;
        }
      }

      Adapt.location._currentLocation = currentLocation;

      var locationModel = Adapt.findById(id) || Adapt.course;
      var htmlClasses = (locationModel && locationModel.get('_htmlClasses')) || '';

      var classes = (Adapt.location._currentId) ? 'location-' +
        Adapt.location._contentType +
        ' location-id-' +
        Adapt.location._currentId
        : 'location-' + Adapt.location._currentLocation;

      var previousClasses = Adapt.location._previousClasses;
      if (previousClasses) {
        this.$html.removeClass(previousClasses);
      }

      Adapt.location._previousClasses = classes + ' ' + htmlClasses;

      this.$html
        .addClass(classes)
        .addClass(htmlClasses)
        .attr('data-location', Adapt.location._currentLocation);

      this.$wrapper
        .removeClass()
        .addClass(classes)
        .attr('data-location', Adapt.location._currentLocation);

      this.setDocumentTitle();

      // Trigger event when location changes.
      Adapt.trigger('router:location', Adapt.location);

      Adapt.wait.queue(onComplete);
    }

    setDocumentTitle() {
      if (!Adapt.location._currentId) return;

      var currentModel = Adapt.findById(Adapt.location._currentId);
      var pageTitle = '';

      if (currentModel && currentModel.get('_type') !== 'course') {
        var currentTitle = currentModel.get('title');

        if (currentTitle) {
          pageTitle = ' | ' + currentTitle;
        }
      }

      var courseTitle = Adapt.course.get('title');
      var documentTitle = $('<div>' + courseTitle + pageTitle + '</div>').text();

      this.listenToOnce(Adapt, 'pageView:ready menuView:ready', () => {
        document.title = documentTitle;
      });
    }

    handleNavigationFocus() {
      if (!this.model.get('_shouldNavigateFocus')) return;
      // Body will be forced to accept focus to start the
      // screen reader reading the page.
      Adapt.a11y.focus('body');
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

  return (Adapt.router = new Router({
    model: new RouterModel(null, { reset: true })
  }));

});
