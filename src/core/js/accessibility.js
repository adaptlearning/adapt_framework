/*
* Accessibility
* License - https://github.com/adaptlearning/adapt_framework/blob/master/LICENSE
* Maintainers - Kirsty Hames, Daryl Hedley
*/

define(function(require) {

    var Adapt = require('coreJS/adapt');
    var AccessibilityView = require('coreViews/accessibilityView');

    var Accessibility = _.extend({

        setupLegacyFocus: function() {
            var tabIndexElements = 'a, button, input, select, textarea';
            // Set tabindex of 0 on tabIndexElements, on focus add class of focused, on blur remove class 
            $(tabIndexElements)
                .attr('tabindex', 0)
                .on('focus', function() {
                    $(this).addClass('focused');
                })
                .on('blur', function() {
                    $(this).removeClass('focused');
                });
            // Set object tab index to -1
            $('object').attr('tabindex', -1);
        },

        removeLegacyFocus: function() {

            var tabIndexElements = 'a, button, input, select, textarea';
            $(tabIndexElements).off('focus').off('blur');

        },

        setupListeners: function() {
            // Listen for pageView / menuView ready, set legacyFocus
            this.listenTo(Adapt, 'pageView:ready menuView:ready', this.setupLegacyFocus);

        },

        setupAccessibility: function() {
            // Check if accessibility is enabled
            if (Adapt.config.get('_accessibility') && Adapt.config.get('_accessibility')._isEnabled) {
                // If enabled add accessibility class
                // If legacy enabled run setupListeners()
                if($('html').addClass('accessibility').hasClass('ie8') && Adapt.config.get('_accessibility')._shouldSupportLegacyBrowsers) {
                    this.setupLegacyFocus();
                    this.setupListeners();
                }
            } else {
                $('html').removeClass('accessibility');
                this.removeLegacyFocus();
                // Stop listeningTo
                this.stopListening(Adapt, 'pageView:ready menuView:ready', this.setupLegacyFocus);
            }
        }

    }, Backbone.Events);


    Adapt.on('accessibility:toggle', Accessibility.setupAccessibility, Accessibility);

    Adapt.once('configModel:dataLoaded', Accessibility.setupAccessibility, Accessibility);

    Adapt.once('app:dataReady', function() {
         new AccessibilityView();
    });

});