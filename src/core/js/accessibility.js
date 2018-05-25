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

        _hasUsageInstructionRead: false,
        _isLoaded: false,
        _hasCourseLoaded: false,

        reset: function() {
            _.extend(this, {
                _hasUsageInstructionRead: false
            });
        },

        initialize: function() {
            //RUN ONCE
            if (this._isLoaded) return;

            this.removeLegacyElements();

            //TRIGGER SETUP ON DATA LOADED AND TOGGLE BUTTON
            Adapt.once('app:dataLoaded', function() {
                //check if accessibility mode should be restored
                this._hasCourseLoaded = true;
                Adapt.config.get("_accessibility")._isActive = Adapt.offlineStorage.get("a11y") || false;
                this.setupAccessibility();

            }, this);

            Adapt.on('accessibility:toggle', this.setupAccessibility, this);

            //SETUP RENDERING HELPERS
            Adapt.once('app:dataLoaded', this.setupHelpers, this);

            //SETUP NO SELECT PARAMETERS ON DEVICE CHANGE
            Adapt.on("device:changed", this.setupNoSelect);

            //Configure the accessibility library
            this.listenToOnce(Adapt, "app:dataReady", this.configureA11yLibrary);

            //CAPTURE ROUTING/NEW DOCUMENT LOADING START AND END
            this.listenTo(Adapt, {
                'router:location': this.onNavigationStart,
                'pageView:ready menuView:ready router:plugin': this.onNavigationEnd
            });
        },

        removeLegacyElements: function() {
            var $legacyElements = $("body").children("#accessibility-toggle, #accessibility-instructions");

            if (!$legacyElements.length) return;

            Adapt.log.warn("DEPRECATED - #accessibility-toggle and #accessibility-instructions have been moved to the navigation bar. Please remove them from all of your .html files.");
            $legacyElements.remove();
        },

        setupAccessibility: function() {
            //CALLED ON BUTTON CLICK AND ON DATA LOAD
            if (!this.isEnabled()) return;

            //save accessibility state
            Adapt.offlineStorage.set("a11y", Adapt.config.get("_accessibility")._isActive);

            this.reset();

            this.configureA11yLibrary();

            // Check if accessibility is active
            if (this.isActive()) {
                this.setupDocument();
                this.setupPopupListeners();
                this.setupLogging();

            } else {

                this.revertDocument();
                this.revertPopupListeners();
                this.removeUsageInstructionListener();
                this.revertLogging();
            }
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

                a11y_normalize: function(text) {
                    return $.a11y_normalize(text);
                },

                a11y_remove_breaks: function(text) {
                    return $.a11y_remove_breaks(text);
                },

                a11y_aria_label: function(text) {
                    return new Handlebars.SafeString('<div class="aria-label prevent-default'+getIgnoreClass()+'" '+getTabIndex()+' role="region">'+text+'</div>');
                },

                a11y_aria_label_relative: function(text) {
                    return new Handlebars.SafeString('<div class="aria-label relative prevent-default'+getIgnoreClass()+'" '+getTabIndex()+' role="region">'+text+'</div>');
                },

                a11y_wrap_focus: function(text) {
                    return new Handlebars.SafeString('<a class="a11y-focusguard a11y-ignore a11y-ignore-focus" '+getTabIndex()+' role="button">&nbsp;</a>');
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

                    return new Handlebars.SafeString(' role="heading" aria-level="'+level+'" '+getTabIndex()+' ');
                },

                a11y_attrs_tabbable: function() {
                    return new Handlebars.SafeString(' role="region" '+getTabIndex()+' ');
                }

            };

            for (var name in helpers) {
                if (helpers.hasOwnProperty(name)) {
                     Handlebars.registerHelper(name, helpers[name]);
                }
            }

            var getTabIndex = function() {
                return this.isActive() ? 'tabindex="0"' : 'tabindex="-1"';
            }.bind(this);

            var getIgnoreClass = function() {
                return $.a11y.options.isTabbableTextEnabled ? '' : ' a11y-ignore';
            }.bind(this);

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

            if (this.isActive()) {
                _.extend($.a11y.options, {
                    isTabbableTextEnabled: true,
                    isUserInputControlEnabled: true,
                    isFocusControlEnabled: true,
                    isFocusLimited: true,
                    isRemoveNotAccessiblesEnabled: true,
                    isAriaLabelFixEnabled: true,
                    isScrollDisableEnabled: true,
                    isScrollDisabledOnPopupEnabled: false,
                    isSelectedAlertsEnabled: true,
                    isAlertsEnabled: true
                });
            } else {
                _.extend($.a11y.options, {
                    isTabbableTextEnabled: false,
                    isUserInputControlEnabled: true,
                    isFocusControlEnabled: true,
                    isFocusLimited: false,
                    isRemoveNotAccessiblesEnabled: true,
                    isAriaLabelFixEnabled: true,
                    isScrollDisableEnabled: true,
                    isScrollDisabledOnPopupEnabled: false,
                    isSelectedAlertsEnabled: false,
                    isAlertsEnabled: false
                });
            }

            this.setupNoSelect();

            $.a11y.ready();
        },

        onNavigationStart: function() {
            this._isLoaded = false;
            //STOP DOCUMENT READING, MOVE FOCUS TO APPROPRIATE LOCATION
            $("#a11y-focuser").a11y_focus(true);
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

            this._isLoaded = true;

            $.a11y_on(false, '.page');
            $.a11y_on(false, '.menu');

            this.configureA11yLibrary();
            $.a11y_update();
            this.setNavigationBar();

            $('#accessibility-toggle').focus();

            //MAKE FOCUS RIGHT
            _.delay(_.bind(function() {
                this.focusInitial();
            }, this), 500);

        },

        setNavigationBar: function() {
            var $navArias = $(".navigation").find(".aria-label").not('#accessibility-instructions');

            if (this.isActive()) {
                $navArias.attr("tabindex", 0).removeAttr("aria-hidden").removeClass("a11y-ignore");
            } else {
                $navArias.attr("tabindex", -1).attr("aria-hidden", "true");
            }
        },

        isActive: function() {
            return Adapt.config.has('_accessibility')
                && Adapt.config.get('_accessibility')._isEnabled
                && Adapt.config.get('_accessibility')._isActive;
        },

        isEnabled: function() {
            return Adapt.config.has('_accessibility')
                && Adapt.config.get('_accessibility')._isEnabled;
        },

        setupDocument: function() {
            this.$html.addClass('accessibility');

            if (Adapt.config.get('_accessibility')._isTextProcessorEnabled) {
                this.$html.addClass('text-to-speech');
            }

            $('.skip-nav-link').removeClass('a11y-ignore a11y-ignore-focus');

            $.a11y(true)
            $.a11y_on(true, "#accessibility-instructions");
        },

        setupPopupListeners: function() {
            this.listenTo(Adapt, 'popup:opened popup:closed', this.onPop);
        },

        setupLogging: function() {
            if (!Adapt.config.get("_accessibility") || !Adapt.config.get("_accessibility")._logReading) return;

            $(document).on("reading", this.onRead);
        },

        revertDocument: function() {
            this.$html.removeClass('accessibility text-to-speech');
            $('.skip-nav-link').addClass('a11y-ignore a11y-ignore-focus');
            $.a11y(false);
            $.a11y_on(false, "#accessibility-instructions");
            $.a11y_on(true, "#accessibility-toggle");
        },

        revertPopupListeners: function() {
            this.stopListening(Adapt, 'popup:opened popup:closed', this.onPop);
        },

        removeUsageInstructionListener:function() {
            $('#accessibility-instructions').off("blur", this.onFocusInstructions);
        },

        revertLogging: function() {
            if (Adapt.course.has("_globals") && (!Adapt.course.get("_globals")._accessibility || !Adapt.course.get("_globals")._accessibility._logReading)) return;

            $($.a11y).off("reading", this.onRead);
        },


        focusInitial: function() {
            if (!this.isActive()) return;

            var debouncedInitial = _.debounce(_.bind(function() {
                //ENABLED DOCUMENT READING

                if (!this._hasUsageInstructionRead) {

                    this._hasUsageInstructionRead = true;

                    $.a11y_on(true, '.page');
                    $.a11y_on(true, '.menu');

                    $('#accessibility-instructions').one("blur", this.onFocusInstructions);

                    _.delay(function(){
                        $('#accessibility-instructions').focusNoScroll();
                    }, 250);

                } else {

                    if (Adapt.location._currentId && $.a11y.options.OS!="mac") {
                        //required to stop JAWS from auto reading content in IE
                        var currentModel = Adapt.findById(Adapt.location._currentId);
                        var alertText = " ";

                        switch (currentModel.get("_type")) {
                            case "page":
                                if (Adapt.course.get("_globals") && Adapt.course.get("_globals")._accessibility && Adapt.course.get("_globals")._accessibility._ariaLabels && Adapt.course.get("_globals")._accessibility._ariaLabels.pageLoaded) {
                                    alertText = Adapt.course.get("_globals")._accessibility._ariaLabels.pageLoaded;
                                }
                                break;

                            case "menu":
                            /* falls through */
                            default:
                                if (Adapt.course.get("_globals") && Adapt.course.get("_globals")._accessibility && Adapt.course.get("_globals")._accessibility._ariaLabels && Adapt.course.get("_globals")._accessibility._ariaLabels.menuLoaded) {
                                    alertText = Adapt.course.get("_globals")._accessibility._ariaLabels.menuLoaded;
                                }
                                break;
                        }

                        $.a11y_alert(alertText);
                    }

                     _.delay(_.bind(function() {
                        var windowScrollTop = $(window).scrollTop();
                        var documentScrollTop = $(document).scrollTop();

                        $.a11y_on(true, '.page');
                        $.a11y_on(true, '.menu');

                        //prevent auto scrolling to top when scroll has been initiated
                        if (windowScrollTop > 0 || documentScrollTop > 0) return;

                        _.delay(function(){
                            $.a11y_focus();
                        }, 500);

                    }, this), 500);

                }

            }, this), 100);
            debouncedInitial();

        },

        onRead: function(event, text) {
            //OUTPUT READ TEXT TO CONSOLE
            console.log("READING: " + text);
        },

        onPop: function() {
            //MAKE SURE POPUP IS CONFIGURED CORRECTLY WITH ARIA LABELS, TABINDEXES ETC
            if (this.isActive()) {
                $.a11y_update();
            }
        },

        onFocusInstructions: function(event) {
            //HIDE INSTRUCTIONS FROM TAB WRAP AROUND AFTER LEAVING INSTRUCTIONS
            if (!Adapt.accessibility._isLoaded) return;
            $('#accessibility-instructions')
                .addClass("a11y-ignore-focus")
                .off("blur", Adapt.accessibility.onFocusInstructions);
        }

    });

    Adapt.accessibility = new Accessibility();

    return Adapt.accessibility;

});
