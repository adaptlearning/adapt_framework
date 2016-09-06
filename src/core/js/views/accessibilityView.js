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
            var hasAccessibility = Adapt.config.has('_accessibility')
                && Adapt.config.get('_accessibility')._isEnabled;

            if (!hasAccessibility) {
                return;
            } else {
                var isActive = Adapt.config.get('_accessibility')._isActive;
                var offLabel = Adapt.course.get('_globals') && (Adapt.course.get('_globals')._accessibility.accessibilityToggleTextOff || Adapt.course.get('_globals')._accessibility._accessibilityToggleTextOff);
                var onLabel = Adapt.course.get('_globals') && (Adapt.course.get('_globals')._accessibility.accessibilityToggleTextOn || Adapt.course.get('_globals')._accessibility._accessibilityToggleTextOn);

                var toggleText = isActive ? offLabel : onLabel;

                this.$el.html(toggleText).attr('aria-label', Adapt.course.get("title") + ". "
                    + Adapt.course.get('_globals')._accessibility._ariaLabels.accessibilityToggleButton + ". "
                    + $.a11y_normalize(toggleText));
            }
        },

        toggleAccessibility: function(event) {
            event.preventDefault();

            var hasAccessibility = Adapt.config.get('_accessibility')._isActive;

            var toggleAccessibility = (hasAccessibility) ? false : true;

            Adapt.config.get('_accessibility')._isActive = toggleAccessibility;

            Adapt.trigger('accessibility:toggle');

            this.render();
            
            Backbone.history.navigate(window.location.hash || "#/", {trigger: true});
        }

    });

    return AccessibilityView;

});
