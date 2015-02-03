/*
* Accessibility
* License - https://github.com/adaptlearning/adapt_framework/blob/master/LICENSE
* Maintainers - Kirsty Hames, Daryl Hedley
*/

define(function(require) {

    var Adapt = require('coreJS/adapt');
    var a11y = require('a11y');
    var AccessibilityView = require('coreViews/accessibilityView');

    var Accessibility = _.extend({
        $html: $('html'),
        $accessibilityInstructions: $("#accessibility-instructions"),
        $accessibilityToggle: $("#accessibility-toggle"),
        _tabIndexElements: 'a, button, input, select, textarea, [tabindex]',
        _hasTabPosition: false,
        _isLoaded: false,
        _legacyFocusElements: undefined,

        setupRequiredListeners: function() {
            //RUN ONCE
            if (this._isLoaded) return;

            //CAPTURE TAB PRESSES TO DIVERT
            $('body').on('keyup', this.onKeyUp);

            //CAPTURE ROUTING/NEW DOCUMENT LOADING START AND END
            this.listenTo(Adapt, 'router:location', this.onNavigationStart);
            this.listenTo(Adapt, 'pageView:ready menuView:ready router:plugin', this.onNavigationEnd);

            //TRIGGER SETUP ON DATA LOADED AND TOGGLE BUTTON
            Adapt.once('app:dataLoaded', this.setupAccessibility, Accessibility);
            Adapt.on('accessibility:toggle', this.setupAccessibility, Accessibility); 

            //SETUP NEW VIEW FOR TOGGLE BUTTON
            Adapt.once('app:dataReady', function() {
                new AccessibilityView();
                });
        },

        setupHelpers: function() {
            //RUN ONCE
            if (this._isLoaded) return;

            //MAKE $.a11y_text and $.a11y_normalize IN GLOBAL HANDLEBARS HELPERS a11y_text and a11y_normalize
            Handlebars.registerHelper('a11y_text', function(text) {
                return $.a11y_text(text);
            });

            Handlebars.registerHelper('a11y_normalize', function(text) {
                return $.a11y_normalize(text);
            });

        },

        touchDeviceCheck: function() {
            //SCREEN READER DON@T USE TABBING
            //FORCE ACCESSIBILITY ON TO RENDER NECESSARY STUFFS FOR TOUCH DEVICE SCREENREADERS

            var isEnabled = this.isEnabled();

            if (!Modernizr.touch || isEnabled) return;

            //If a touch device and not enabled, remove accessibility button and turn on accessibility

            this._isLoaded = true;
            
             //Remove button  
            this.$accessibilityToggle.remove();

            //Force accessibility on
            Adapt.config.get('_accessibility')._isEnabled = true;
            Adapt.trigger('accessibility:toggle', true);

        },

        isEnabled: function() {
            return Adapt.config.get('_accessibility') && Adapt.config.get('_accessibility')._isEnabled;
        },

        setupAccessibility: function() {
            //CALLED ON BUTTON CLICK AND ON DATA LOAD

            this.setupHelpers();

            this.touchDeviceCheck();

            // Check if accessibility is enabled
            var isEnabled = this.isEnabled();

            this.checkTabCapture();

            if (isEnabled) {
                
                this.setupDocument();
                this.setupLegacy();
                this.setupPopupListeners()
                this.setupUsageInstructions();
                this.setupLogging();
                this.focusInitial();

            } else {

                this.rollbackDocument();
                this.rollbackLegacy();
                this.rollbackPopupListeners();
                this.rollbackUsageInstructions();
                this.rollbackLogging();
            
                }



        },

        checkTabCapture: function() {
            if (!this._isLoaded) return;

            var isEnabled = this.isEnabled();
            
            $.a11y( isEnabled );

            if ( isEnabled ) {

                //IF ACCESSIBILTY TURNED ON GOTO FIRST FOCUSABLE ITEM
                this.focusInitial();

            } else {

                //OTHERWISE ENABLE TAB REDIRECTION TO TOGGLE BUTTON
                this._hasTabPosition = false;
            }
        },

        setupDocument: function() {
            this.$html.addClass('accessibility');
            $.a11y(true)
            $.a11y_on(true);
        },

        rollbackDocument: function() {
            this.$html.removeClass('accessibility');
            $.a11y(false)
            $.a11y_on(false);
        },

        setupLegacy: function() {
            //IE8 .focused CLASS AS :focus ISN'T AVAILABLE

            if(!this.$html.hasClass('ie8') || !Adapt.config.get('_accessibility')._shouldSupportLegacyBrowsers) return;

            // If legacy enabled run setupLegacyListeners()
            this.listenTo(Adapt, 'pageView:ready menuView:ready', this.setupLegacyFocusClasser);
            this.listenTo(Adapt, 'remove', this.removeLegacyFocusClasser);

        },

        rollbackLegacy: function() {

            if(!this.$html.hasClass('ie8') || !Adapt.config.get('_accessibility')._shouldSupportLegacyBrowsers) return;

            this.stopListening(Adapt, 'pageView:ready menuView:ready', this.setupLegacyFocusClasser);
            this.stopListening(Adapt, 'remove', this.removeLegacyFocusClasser);

        },

        setupPopupListeners: function() {
            this.listenTo(Adapt, 'popup:opened popup:closed', this.onPop);
        },

        rollbackPopupListeners: function() {
            this.stopListening(Adapt, 'popup:opened popup:closed', this.onPop);
        },

        setupUsageInstructions: function() {            
            if (!Adapt.course.get("_globals")._accessibility || !Adapt.course.get("_globals")._accessibility._accessibilityInstructions) {
                this.$accessibilityInstructions.remove();
                return;
            }

            var instructionsList = Adapt.course.get("_accessibility")._accessibilityInstructions;

            var usageInstructions;
            if (instructionsList[Adapt.device.browser]) {
                usageInstructions = instructionsList[Adapt.device.browser];
            } else if (Modernizr.touch) {
                usageInstructions = instructionsList.touch || "";
            } else {
                usageInstructions = instructionsList.notouch || "";
            }

           this.$accessibilityInstructions
                .one("blur", this.onFocusInstructions)
                .html( usageInstructions );
        },

        rollbackUsageInstructions: function() {
            if (!Adapt.course.get("_globals")._accessibility || !Adapt.course.get("_globals")._accessibility._accessibilityInstructions) return;

            this.$accessibilityInstructions
                .off("blur", this.onFocusInstructions)
        },

        setupLogging: function() {
            if (!Adapt.course.get("_globals")._accessibility || !Adapt.course.get("_globals")._accessibility._logReading) return;

            $($.a11y).on("reading", this.onRead);
        },

        rollbackLogging: function() {
            if (!Adapt.course.get("_globals")._accessibility || !Adapt.course.get("_globals")._accessibility._logReading) return;

            $($.a11y).off("reading", this.onRead);
        },

        setupLegacyFocusClasser: function() {
            this.removeLegacyFocusClasser();

            // On focus add class of focused, on blur remove class 
            this._legacyFocusElements = $(this._tabIndexElements);
            this._legacyFocusElements
                .on('focus', this.onElementFocused)
                .on('blur', this.onElementBlurred);
        },

        removeLegacyFocusClasser: function() {
            if (this._legacyFocusElements === undefined) return;

            //Remove focus and blur events
            this._legacyFocusElements
                .off('focus', this.onElementFocused)
                .off('blur', this.onElementBlurred);
            this._legacyFocusElements = undefined;

        },

        focusInitial: function() {
            if (!this.isEnabled()) return;

            this._hasTabPosition = true;

            _.delay(function() {
                $.a11y_focus();
            }, 250);
        },

        onElementFocused: function(event) {
             $(this).addClass('focused');
        },

        onElementBlurred: function(event) {
            $(this).removeClass('focused');
        },

        onNavigationStart: function() {
            this._isLoaded = false;
            //STOP DOCUMENT READING
            $.a11y_on(false);
        },

        onNavigationEnd: function() {
            var isEnabled = this.isEnabled();

            this._isLoaded = true;

            if (isEnabled) {
                var topOffset = $('.navigation').height()+10;
                var bottomoffset = 0;

                $.a11y.options.focusOffsetTop = topOffset;
                $.a11y.options.focusOffsetBottom = bottomoffset;
                $.a11y.options.OS = Adapt.device.OS.toLowerCase();     
                $.a11y.options.isTouchDevice = Modernizr.touch;
                
                //ENABLED DOCUMENT READING
                $.a11y_on(true);

                //UPDATE NEW DOCUMENT WITH ARIA_LABEL CONFIGURATIONS ETC
                $.a11y_update();
            } else {
                this.touchDeviceCheck();
            }
            
            //MAKE FOCUS RIGHT
            this._hasTabPosition = false
            this.focusInitial();

        },

        onRead: function(event, text) {
            //OUTPUT READ TEXT TO CONSOLE
            console.log("READING: " + text);
        },

        onPop: function() {
            var isEnabled = this.isEnabled();

            //MAKE SURE POPUP IS CONFIGURED CORRECTLY WITH ARIA LABELS, TABINDEXES ETC
            if ( isEnabled ) $.a11y_update();
        },

        onKeyUp: function(event) {

            //IF NOT TAB KEY, RETURN
            if (event.which !== 9) return;

            //IF INITIAL TAB NOT CAPTURED AND ACCESSIBILITY NOT ON, RETURN
            if ( Accessibility.isEnabled() && Accessibility._hasTabPosition ) return;
                   
            //IF TAB PRESSED, AND TAB REDIRECTION ON, ALWAYS TAB TO ACCESSIBILITY BUTTON ONLY
            Accessibility.$accessibilityToggle.focus();

        },

        onFocusInstructions: function(event) {
            //HIDE INSTRUCTIONS FROM TAB WRAP AROUND AFTER LEAVING INSTRUCTIONS
            if (!Accessibility._hasTabPosition) return;
            if (!Accessibility._isLoaded) return;
            $(event.target).addClass("a11y-ignore-focus");
        }

    }, Backbone.Events);


    Accessibility.setupRequiredListeners();

    });
