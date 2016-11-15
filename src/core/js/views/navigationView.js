define(function(require) {

    var Backbone = require('backbone');
    var Handlebars = require('handlebars');
    var Adapt = require('coreJS/adapt');

    var NavigationView = Backbone.View.extend({

        className: "navigation",

        initialize: function() {
            this.listenToOnce(Adapt, 'courseModel:dataLoading', this.remove);
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
            var template = Handlebars.templates[this.template]
            this.$el.html(template({_globals: Adapt.course.get("_globals")})).appendTo('#wrapper');
            _.defer(_.bind(function() {
                Adapt.trigger('navigationView:postRender', this);
            }, this));
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
        }

    });

    return NavigationView;

});
