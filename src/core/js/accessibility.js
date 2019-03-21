define([
  'core/js/adapt',
  'a11y'
], function(Adapt) {

  var defaultAriaLevels = {
    '_menu': 1,
    '_menuItem': 2,
    '_page': 1,
    '_article': 2,
    '_block': 3,
    '_component': 4,
    '_componentItem': 5
  };

  var Accessibility = Backbone.Controller.extend({

    $html: $('html'),
    config: null,

    initialize: function() {

      this.removeLegacyElements();

      this.listenToOnce(Adapt, {
        'app:dataLoaded': this.initialSetup,
        'app:dataReady': this.configureA11yLibrary,
        'navigationView:postRender': this.removeLegacyElements
      }, this);

      Adapt.on('device:changed', this.setupNoSelect);

      this.listenTo(Adapt, {
        'router:location': this.onNavigationStart,
        'pageView:ready menuView:ready router:plugin': this.onNavigationEnd
      });
    },

    initialSetup: function() {
      this.config = Adapt.config.get('_accessibility');

      this.config._isActive = false;

      this.setupAccessibility();

      this.setupHelpers();
    },

    removeLegacyElements: function() {
      var $legacyElements = $('body').children('#accessibility-toggle, #accessibility-instructions');
      var $navigationElements = $('.nav').find('#accessibility-toggle, #accessibility-instructions');

      if (!$legacyElements.length && !$navigationElements.length) return;

      Adapt.log.warn('REMOVED - #accessibility-toggle and #accessibility-instructions have been removed. Please remove them from all of your .html files.');
      $legacyElements.remove();
      $navigationElements.remove();
    },

    setupAccessibility: function() {
      if (!this.isEnabled()) return;

      Adapt.offlineStorage.set('a11y', false);

      this.configureA11yLibrary();
      this.setupDocument();
      this.setupPopupListeners();
      this.setupLogging();
    },

    setupHelpers: function() {
      var helpers = {

        a11y_text: function(text) {
          Adapt.log.warn('DEPRECATED: a11y_text is no longer required. https://tink.uk/understanding-screen-reader-interaction-modes/');
          return text;
        },

        a11y_normalize: function(texts) {
          var values = Array.prototype.slice.call(arguments, 0,-1);
          values = values.filter(Boolean);
          return $.a11y_normalize(values.join(' '));
        },

        a11y_remove_breaks: function(texts) {
          var values = Array.prototype.slice.call(arguments, 0,-1);
          values = values.filter(Boolean);
          return $.a11y_remove_breaks(values.join(' '));
        },

        a11y_aria_label: function(texts) {
          var values = Array.prototype.slice.call(arguments, 0,-1);
          values = values.filter(Boolean);
          return new Handlebars.SafeString('<div class="aria-label">'+values.join(' ')+'</div>');
        },

        a11y_aria_label_relative: function(texts) {
          var values = Array.prototype.slice.call(arguments, 0,-1);
          values = values.filter(Boolean);
          return new Handlebars.SafeString('<div class="aria-label relative">'+values.join(' ')+'</div>');
        },

        a11y_aria_image: function(texts) {
          var values = Array.prototype.slice.call(arguments, 0,-1);
          values = values.filter(Boolean);
          return new Handlebars.SafeString('<div class="aria-label" role="img" aria-label="'+values.join(' ')+'"></div>');
        },

        a11y_wrap_focus: function(text) {
          return new Handlebars.SafeString('<a class="a11y-focusguard a11y-ignore a11y-ignore-focus" role="presentation">&nbsp;</a>');
        },

        a11y_attrs_heading: function(levelOrType) {
          // get the global configuration from config.json
          var cfg = Adapt.config.get('_accessibility');
          // default level to use if nothing overrides it
          var level = 1;

          // first check to see if the Handlebars context has an override
          if (this._ariaLevel) {
            levelOrType = this._ariaLevel;
          }

          if (isNaN(levelOrType) === false) {
            // if a number is passed just use this
            level = levelOrType;
          }
          else if (_.isString(levelOrType)) {
            // if a string is passed check if it is defined in global configuration
            cfg._ariaLevels = cfg._ariaLevels || defaultAriaLevels;
            if (cfg._ariaLevels && cfg._ariaLevels["_"+levelOrType] !== undefined) {
              level = cfg._ariaLevels["_"+levelOrType];
            }
          }

          return new Handlebars.SafeString(' role="heading" aria-level="'+level+'" ');
        },

        a11y_attrs_tabbable: function() {
          return new Handlebars.SafeString(' role="region" tabindex="0" ');
        }

      };

      for (var name in helpers) {
        if (helpers.hasOwnProperty(name)) {
          Handlebars.registerHelper(name, helpers[name]);
        }
      }

    },

    setupNoSelect: function() {
      if (!this.config || !this.config._disableTextSelectOnClasses) return;

      var classes = this.config._disableTextSelectOnClasses.split(' ');

      var isMatch = false;
      for (var i = 0, item; item = classes[i++];) {
        if ($('html').is(item)) {
          isMatch = true;
          break;
        }
      }

      $('html').toggleClass('u-no-select', isMatch);
    },

    configureA11yLibrary: function() {

      $.a11y.options.OS = Adapt.device.OS.toLowerCase();
      $.a11y.options.isTouchDevice = Adapt.device.touch;

      _.extend($.a11y.options, {
        isUserInputControlEnabled: true,
        isFocusControlEnabled: true,
        isRemoveNotAccessiblesEnabled: true,
        isScrollDisableEnabled: true,
        isScrollDisabledOnPopupEnabled: false
      });

      this.setupNoSelect();

      $.a11y.ready();
    },

    /**
     * stop document reading, move focus to appropriate location
     */
    onNavigationStart: function() {
      _.defer(function() {
        $.a11y_on(false, '.page');
        $.a11y_on(false, '.menu');
      });
    },

    onNavigationEnd: function(view) {
      //prevent sub-menu items provoking behaviour
      if (view && view.model) {
        if (view.model.get('_id') !== Adapt.location._currentId) return;
      }

      $.a11y_on(true, '.page');
      $.a11y_on(true, '.menu');

      this.configureA11yLibrary();
      $.a11y_update();

    },

    isActive: function() {
      Adapt.log.warn('REMOVED - accessibility is now always active when enabled. Please unify your user experiences.');
      return false;
    },

    isEnabled: function() {
      return this.config && this.config._isEnabled;
    },

    setupDocument: function() {
      this.$html.addClass('accessibility');
      $.a11y(true);
    },

    setupPopupListeners: function() {
      this.listenTo(Adapt, 'popup:opened popup:closed', this.onPop);
    },

    setupLogging: function() {
      if (!this.config || !this.config._logReading) return;
      $(document).on('reading', this.onRead);
    },

    /**
     * output read text to console
     */
    onRead: function(event, text) {
      console.log('READING: ' + text);
    },

    /**
     * make sure popup is configured correctly with aria labels, tabindexes etc
     */
    onPop: function() {
      $.a11y_update();
    }

  });

  Adapt.accessibility = new Accessibility();

  return Adapt.accessibility;

});
