define([
    'core/js/adapt',
    'a11y'
], function(Adapt) {

    var defaultAriaLevels = {
        "_menu": 1,
        "_menuItem": 2,
        "_page": 1,
        "_article": 2,
        "_block": 3,
        "_component": 4,
        "_componentItem": 5
    };

    var Accessibility = Backbone.Controller.extend({

        $html: $('html'),

        initialize: function() {

            this.removeLegacyElements();

            this.listenToOnce(Adapt, {
                //TRIGGER SETUP ON DATA LOADED
                'app:dataLoaded': this.initialSetup,
                //Configure the accessibility library
                'app:dataReady': this.configureA11yLibrary,
                'navigationView:postRender': this.removeLegacyElements
            }, this);

            //SETUP NO SELECT PARAMETERS ON DEVICE CHANGE
            Adapt.on("device:changed", this.setupNoSelect);

            //CAPTURE ROUTING/NEW DOCUMENT LOADING START AND END
            this.listenTo(Adapt, {
                'router:location': this.onNavigationStart,
                'pageView:ready menuView:ready router:plugin': this.onNavigationEnd
            });
        },

        initialSetup: function() {

            Adapt.config.get("_accessibility")._isActive = false;
            this.setupAccessibility();

            //SETUP RENDERING HELPERS
            this.setupHelpers();

        },

        removeLegacyElements: function() {
            var $legacyElements = $("body").children("#accessibility-toggle, #accessibility-instructions");
            var $navigationElements = $(".navigation").find("#accessibility-toggle, #accessibility-instructions");

            if (!$legacyElements.length && !$navigationElements.length) return

            Adapt.log.warn("REMOVED - #accessibility-toggle and #accessibility-instructions have been removed. Please remove them from all of your .html files.");
            $legacyElements.remove();
            $navigationElements.remove();
        },

        setupAccessibility: function() {
            //CALLED ON DATA LOAD
            if (!this.isEnabled()) return;

            //save accessibility state
            Adapt.offlineStorage.set("a11y", false);

            this.configureA11yLibrary();
            this.setupDocument();
            this.setupPopupListeners();
            this.setupLogging();

        },

        setupHelpers: function() {

            //MAKE $.a11y_text and $.a11y_normalize IN GLOBAL HANDLEBARS HELPERS a11y_text and a11y_normalize
            var config = Adapt.config.has('_accessibility')
                ? Adapt.config.get("_accessibility")
                : false;

            var helpers = {

                a11y_text: function(text) {
                    //ALLOW ENABLE/DISABLE OF a11y_text HELPER
                    if (config && config._isTextProcessorEnabled === false) {
                        return text;
                    } else {
                        return $.a11y_text(text);
                    }
                },

                a11y_normalize: function(texts) {
                    var values = Array.prototype.slice.call(arguments, 0,-1);
                    values = values.filter(Boolean);
                    return $.a11y_normalize(values.join(" "));
                },

                a11y_remove_breaks: function(texts) {
                    var values = Array.prototype.slice.call(arguments, 0,-1);
                    values = values.filter(Boolean);
                    return $.a11y_remove_breaks(values.join(" "));
                },

                a11y_aria_label: function(texts) {
                    var values = Array.prototype.slice.call(arguments, 0,-1);
                    values = values.filter(Boolean);
                    return new Handlebars.SafeString('<div class="aria-label prevent-default">'+values.join(" ")+'</div>');
                },

                a11y_aria_label_relative: function(texts) {
                    var values = Array.prototype.slice.call(arguments, 0,-1);
                    values = values.filter(Boolean);
                    return new Handlebars.SafeString('<div class="aria-label relative prevent-default">'+values.join(" ")+'</div>');
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
            if (!Adapt.config.get('_accessibility') || !Adapt.config.get('_accessibility')._disableTextSelectOnClasses) return;

            var classes = Adapt.config.get('_accessibility')._disableTextSelectOnClasses.split(" ");

            var isMatch = false;
            for (var i = 0, item; item = classes[i++];) {
                if ($('html').is(item)) {
                    isMatch = true;
                    break;
                }
            }

            if (isMatch) {
                $('html').addClass("no-select");
            } else  {
                $('html').removeClass("no-select");
            }

        },

        configureA11yLibrary: function() {

            var topOffset = $('.navigation').height();
            var bottomoffset = 0;
            $.a11y.options.focusOffsetTop = topOffset;
            $.a11y.options.focusOffsetBottom = bottomoffset;
            $.a11y.options.OS = Adapt.device.OS.toLowerCase();
            $.a11y.options.isTouchDevice = Adapt.device.touch;

            _.extend($.a11y.options, {
                isTabbableTextEnabled: false,
                isUserInputControlEnabled: true,
                isFocusControlEnabled: true,
                isFocusLimited: false,
                isRemoveNotAccessiblesEnabled: true,
                isScrollDisableEnabled: true,
                isScrollDisabledOnPopupEnabled: false,
                isSelectedAlertsEnabled: true,
                isAlertsEnabled: true
            });

            this.setupNoSelect();

            $.a11y.ready();
        },

        onNavigationStart: function() {
            //STOP DOCUMENT READING, MOVE FOCUS TO APPROPRIATE LOCATION
            _.defer(function() {
                $.a11y_on(false, '.page');
                $.a11y_on(false, '.menu');
            });
        },

        onNavigationEnd: function(view) {
            //prevent sub-menu items provoking behaviour
            if (view && view.model) {
                if (view.model.get("_id") != Adapt.location._currentId) return;
            }

            //always use detached aria labels for divs and spans
            _.defer(function() {
                $('body').a11y_aria_label(true);
            });

            $.a11y_on(true, '.page');
            $.a11y_on(true, '.menu');

            this.configureA11yLibrary();
            $.a11y_update();

        },

        isActive: function() {
            Adapt.log.warn("REMOVED - accessibility is now always active when enabled. Please unify your user experiences.")
            return false;
        },

        isEnabled: function() {
            return Adapt.config.has('_accessibility')
                && Adapt.config.get('_accessibility')._isEnabled;
        },

        setupDocument: function() {
            this.$html.addClass('accessibility');
            $.a11y(true)
        },

        setupPopupListeners: function() {
            this.listenTo(Adapt, 'popup:opened popup:closed', this.onPop);
        },

        setupLogging: function() {
            if (!Adapt.config.get("_accessibility") || !Adapt.config.get("_accessibility")._logReading) return;
            $(document).on("reading", this.onRead);
        },

        onRead: function(event, text) {
            //OUTPUT READ TEXT TO CONSOLE
            console.log("READING: " + text);
        },

        onPop: function() {
            //MAKE SURE POPUP IS CONFIGURED CORRECTLY WITH ARIA LABELS, TABINDEXES ETC
            $.a11y_update();
        }

    });

    Adapt.accessibility = new Accessibility();

    return Adapt.accessibility;

});
