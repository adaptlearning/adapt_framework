define([
  'core/js/adapt',
  'core/js/models/routerModel',
  'core/js/views/pageView',
  'core/js/startController'
], function(Adapt, RouterModel, PageView) {

  Adapt.router = new RouterModel(null, { reset: true });

  var Router = Backbone.Router.extend({

    // Flag to indicate if the router has tried to redirect to the current location.
    _isCircularNavigationInProgress: false,

    initialize: function() {
      this.showLoading();

      // Store #wrapper element and html to cache for later use.
      this.$wrapper = $('#wrapper');
      this.$html = $('html');

      Adapt.once('app:dataReady', function() {
        document.title = Adapt.course.get('title');
      });

      this.listenTo(Adapt, {
        'navigation:backButton': this.navigateToPreviousRoute,
        'navigation:homeButton': this.navigateToHomeRoute,
        'navigation:skipNavigation': this.skipNavigation,
        'navigation:parentButton': this.navigateToParent,
        'router:navigateTo': this.navigateToArguments
      });
    },

    routes: {
      '': 'handleRoute',
      'id/:id': 'handleRoute',
      ':pluginName(/*location)(/*action)': 'handleRoute'
    },

    pruneArguments: function(args) {
      var prunedArgs = _.toArray(args);

      if (prunedArgs.length !== 0) {
        // Remove any null arguments.
        prunedArgs = _.without(args, null);
      }

      return prunedArgs;
    },

    handleRoute: function() {
      var args = this.pruneArguments(arguments);

      if (Adapt.router.get('_canNavigate')) {
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
      if (Adapt.router.get('_canNavigate')) {
        // Disable navigation whilst rendering.
        Adapt.router.set('_canNavigate', false, { pluginName: 'adapt' });

        switch (args.length) {
          case 1:
            // If only one parameter assume it's the ID.
            return this.handleId.apply(this, args);
          case 2:
            // If there are two parameters assume it's a plugin.
            return this.handlePluginRouter.apply(this, args);
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
    },

    handlePluginRouter: function(pluginName, location, action) {
      var pluginLocation = pluginName;

      if (location) {
        pluginLocation = pluginLocation + '-' +location;

        if (action) {
          pluginLocation = pluginLocation + '-' + action;
        }
      }

      this.updateLocation(pluginLocation, null, null, function() {
        Adapt.trigger('router:plugin:' + pluginName, pluginName, location, action);
        Adapt.trigger('router:plugin', pluginName, location, action);

        Adapt.router.set('_canNavigate', true, { pluginName: 'adapt' });
      });
    },

    handleCourse: function() {
      if (Adapt.course.has('_start')) {
        // Do not allow access to the menu when the start controller is enabled.
        var startController = Adapt.course.get('_start');

        if (startController._isEnabled == true && startController._isMenuDisabled == true) {
          return;
        }
      }

      this.showLoading();

      this.removeViews(_.bind(function() {
        Adapt.course.set('_isReady', false);

        this.setContentObjectToVisited(Adapt.course);

        this.updateLocation('course', null, null, _.bind(function() {
          Adapt.once('menuView:ready', function() {
            // Allow navigation.
            Adapt.router.set('_canNavigate', true, { pluginName: 'adapt' });
            this.handleNavigationFocus();
          }.bind(this));

          Adapt.trigger('router:menu', Adapt.course);
        }, this));
      }, this));
    },

    handleId: function(id) {
      var currentModel = Adapt.findById(id);
      var type = '';

      if (!currentModel) {
        Adapt.router.set('_canNavigate', true, { pluginName: 'adapt' });
        return;
      }

      type = currentModel.get('_type');

      switch (type) {
        case 'page':
        case 'menu':
          if (currentModel.get('_isLocked') && Adapt.config.get('_forceRouteLocking')) {
            Adapt.log.warn('Unable to navigate to locked id: ' + id);
            Adapt.router.set('_canNavigate', true, {pluginName: 'adapt'});
            if (Adapt.location._previousId === undefined) {
              return this.navigate('#/', { trigger: true, replace: true });
            } else {
              return Backbone.history.history.back();
            }
          } else {
            this.showLoading();
            this.removeViews(_.bind(function() {

              this.setContentObjectToVisited(currentModel);

              if (type == 'page') {
                var location = 'page-' + id;
                this.updateLocation(location, 'page', id, _.bind(function() {
                  Adapt.once('pageView:ready', function() {
                    // Allow navigation.
                    Adapt.router.set('_canNavigate', true, { pluginName: 'adapt' });
                    this.handleNavigationFocus();
                  }.bind(this));
                  Adapt.trigger('router:page', currentModel);
                  this.$wrapper.append(new PageView({ model: currentModel }).$el);
                }, this));
              } else {
                var location = 'menu-' + id;
                this.updateLocation(location, 'menu', id, _.bind(function() {
                  Adapt.once('menuView:ready', function() {
                    // Allow navigation.
                    Adapt.router.set('_canNavigate', true, { pluginName: 'adapt' });
                    this.handleNavigationFocus();
                  }.bind(this));
                  Adapt.trigger('router:menu', currentModel);
                }, this));
              }
            }, this));
          }
          break;
        default:
          // Allow navigation.
          Adapt.router.set('_canNavigate', true, { pluginName: 'adapt' });
          Adapt.navigateToElement('.' + id, { replace: true });
      }
    },

    removeViews: function(onComplete) {
      Adapt.remove();

      Adapt.wait.queue(onComplete);
    },

    showLoading: function() {
      $('.js-loading').show();
    },

    navigateToArguments: function(args) {
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
          Adapt.log.warn('DEPRECATED - use Backbone.history.navigate or ' +
            'window.location.href instead of Adapt.trigger("router:navigateTo")');
          this.handleRoute.apply(this, args);
      }
    },

    skipNavigation: function() {
      Adapt.a11y.focusFirst('.' + Adapt.location._contentType);
    },

    navigateToPreviousRoute: function(force) {
      // Sometimes a plugin might want to stop the default navigation.
      // Check whether default navigation has changed.
      if (Adapt.router.get('_canNavigate') || force) {
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
    },

    navigateToHomeRoute: function(force) {
      if (Adapt.router.get('_canNavigate') || force ) {
        this.navigate('#/', { trigger: true });
      }
    },

    navigateToCurrentRoute: function(force) {
      if (Adapt.router.get('_canNavigate') || force) {
        if (!Adapt.location._currentId) {
          return;
        }
        var currentId = Adapt.location._currentId;
        var route = (currentId === Adapt.course.get('_id')) ? '#/' : '#/id/' + currentId;
        this.navigate(route, { trigger: true, replace: true });
      }
    },

    navigateToParent: function(force) {
      if (Adapt.router.get('_canNavigate') || force) {
        var parentId = Adapt.contentObjects.findWhere({ _id: Adapt.location._currentId }).get('_parentId');
        var route = (parentId === Adapt.course.get('_id')) ? '#/' : '#/id/' + parentId;
        this.navigate(route, { trigger: true });
      }
    },

    setContentObjectToVisited: function(model) {
      model.set('_isVisited', true);
    },

    updateLocation: function(currentLocation, type, id, onComplete) {
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
      var htmlClassName = locationModel && locationModel.get('_htmlClassName') || '';

      var classes = (Adapt.location._currentId) ? 'location-'
        + Adapt.location._contentType
        + ' location-id-'
        + Adapt.location._currentId :
        'location-' + Adapt.location._currentLocation;

      var previousClasses = Adapt.location._previousClasses;
      if (previousClasses) {
        this.$html.removeClass(previousClasses);
      }

      Adapt.location._previousClasses = classes + ' ' + htmlClassName;

      this.$html
          .addClass(classes)
          .addClass(htmlClassName)
          .attr('data-location', Adapt.location._currentLocation);

      this.$wrapper
          .removeClass()
          .addClass(classes)
          .attr('data-location', Adapt.location._currentLocation);

      this.setDocumentTitle();

      // Trigger event when location changes.
      Adapt.trigger('router:location', Adapt.location);

      Adapt.wait.queue(onComplete);
    },

    setDocumentTitle: function() {
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

      Adapt.once('pageView:ready menuView:ready', function() {
        document.title = documentTitle;
      });
    },

    handleNavigationFocus: function() {
      if (!Adapt.router.get("_shouldNavigateFocus")) return;
      // Body will be forced to accept focus to start the
      // screen reader reading the page.
      Adapt.a11y.focus('body');
    }
  });

  return new Router({ model: new Backbone.Model() });

});
