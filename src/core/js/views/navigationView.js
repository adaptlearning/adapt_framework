define([
    'core/js/adapt',
    'core/js/views/accessibilityView'
], function(Adapt, AccessibilityView) {

    var NavigationView = Backbone.View.extend({

        className: "navigation",

        initialize: function() {
            this.listenToOnce(Adapt, {
                'courseModel:dataLoading': this.remove,
                'accessibility:toggle': this.onA11yToggle
            });
            this.listenTo(Adapt, 'router:menu router:page', this.hideNavigationButton);
            this.template = "navigation";
            this.preRender();
        },

        events: {
            'click [data-event]':'triggerEvent'
        },

        preRender: function() {
            Adapt.trigger('navigationView:preRender', this);
            this.render();
        },

        render: function() {
            var template = Handlebars.templates[this.template];
            this.$el.html(template(
                {
                    _globals: Adapt.course.get("_globals"),
                    _accessibility: Adapt.config.get("_accessibility")
                }
            )).insertBefore('#wrapper');

            _.defer(_.bind(function() {
                Adapt.trigger('navigationView:postRender', this);
            }, this));

            this.setupA11yButton();

            if (Adapt.accessibility.isActive()) {
                this.setupUsageInstructions();
            }

            return this;
        },

        triggerEvent: function(event) {
            event.preventDefault();
            var currentEvent = $(event.currentTarget).attr('data-event');
            Adapt.trigger('navigation:' + currentEvent);
        },

        hideNavigationButton: function(model) {
            if (model.get('_type') === "course") {
                $('.navigation-back-button, .navigation-home-button').addClass('display-none');
            } else {
                this.showNavigationButton();
            }
        },

        showNavigationButton: function() {
            $('.navigation-back-button, .navigation-home-button').removeClass('display-none');
        },

        setupA11yButton: function() {
            new AccessibilityView();
        },

        setupUsageInstructions: function() {
            var config = Adapt.course.get("_globals")._accessibility;

            if (!config || !config._accessibilityInstructions) {
                this.$('#accessibility-instructions').remove();
                return;
            }

            var instructionsList = config._accessibilityInstructions;

            var usageInstructions;
            if (instructionsList[Adapt.device.browser]) {
                usageInstructions = instructionsList[Adapt.device.browser];
            } else if (Modernizr.touch) {
                usageInstructions = instructionsList.touch || "";
            } else {
                usageInstructions = instructionsList.notouch || "";
            }

           this.$('#accessibility-instructions').html( usageInstructions );
        },

        onA11yToggle:function() {
            // listen once because if a11y active on launch instructions will already be setup
            
            if (Adapt.accessibility.isActive()) {
                this.setupUsageInstructions();
            }
        }

    });

    return NavigationView;

});
