/*
* Accessibility
* License - https://github.com/adaptlearning/adapt_framework/blob/master/LICENSE
* Maintainers - Kirsty Hames, Daryl Hedley
*/

define(function(require) {

    var Adapt = require('coreJS/adapt');

    function setupLegacyFocus() {
        var tabIndexElements = 'a, button, input, select, textarea';
        $(tabIndexElements).attr('tabindex', 0);
        $('button, select, textarea, a, input, label').on('focus', function() {
            $(this).addClass('focused');
        });

        $('button, select, textarea, a, input, label').on('blur', function() {
            $(this).removeClass('focused');
        });
        $('object').attr('tabindex', -1);
    };

    function setupListeners() {
        Adapt.on('pageView:ready menuView:ready', function() {
            setupLegacyFocus();
        });
    }

    Adapt.on('configModel:dataLoaded', function() {

        // Check if accessibility is enabled
        if (Adapt.config.get('_accessibility') && Adapt.config.get('_accessibility')._isEnabled) {
            // If enabled add accessibility class
            // If legacy enabled run setupListeners()
            if($('html').addClass('accessibility').hasClass('ie8') && Adapt.config.get('_accessibility')._shouldSupportLegacyBrowsers) {
                setupListeners();
                
            }
        }


    });  

});