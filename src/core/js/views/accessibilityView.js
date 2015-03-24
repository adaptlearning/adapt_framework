/*
* Accessibility View
* License - https://github.com/adaptlearning/adapt_framework/blob/master/LICENSE
* Maintainers - Kirsty Hames, Daryl Hedley
*/

define(function(require) {

    var Backbone = require('backbone');
    var Adapt = require('coreJS/adapt');

    var AccessibilityView = Backbone.View.extend({

        el: '#accessibility-toggle',

        initialize: function() {
            this.render();
        },

        events: {
            'click' : 'toggleAccessibility'
        },

        render: function() {

            var hasAccessibility = Adapt.config.get('_accessibility')._isEnabled;
            var accessibilityOff = Adapt.course.get('_globals')._accessibility._accessibilityToggleTextOff;
            var accessibilityOn = Adapt.course.get('_globals')._accessibility._accessibilityToggleTextOn;

            var toggleText = (hasAccessibility) ? accessibilityOff : accessibilityOn;

            this.$el.html(toggleText).attr('aria-label', Adapt.course.get('_globals')._accessibility._ariaLabels.accessibilityToggleButton);

        },



        toggleAccessibility: function(event) {
            event.preventDefault();

            var hasAccessibility = Adapt.config.get('_accessibility')._isEnabled;

            var toggleAccessibility = (hasAccessibility) ? false : true;

            Adapt.config.get('_accessibility')._isEnabled = toggleAccessibility;

            Adapt.trigger('accessibility:toggle');

            this.render();

        }    

    });

    return AccessibilityView;

});