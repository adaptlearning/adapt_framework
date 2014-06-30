/*
* NavigationView
* License - https://github.com/adaptlearning/adapt_framework/blob/master/LICENSE
* Maintainers - Daryl Hedley
*/

define(function(require) {
    
    var Backbone = require('backbone');
    var Handlebars = require('handlebars');
    var Adapt = require('coreJS/adapt');

    var NavigationView = Backbone.View.extend({
        
        className: "navigation",
        
        initialize: function() {
            this.listenTo(Adapt, 'router:menu router:page', this.hideNavigationButton);
            this.template = "navigation";
            this.listenTo(Adapt, 'app:dataReady', this.setup);
        },
        
        events: {
            'click a':'triggerEvent'
        },

        setup: function() {
            Adapt.trigger('navigationView:preRender', this);
            this.render();
        },
        
        render: function() {
            var template = Handlebars.templates[this.template]
            this.$el.html(template(Adapt.course.get('_accessibility')._ariaLabels)).appendTo('#wrapper');
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
                $('.navigation-back-button').addClass('display-none');
            } else {
                this.showNavigationButton();
            }
        },

        showNavigationButton: function() {
            $('.navigation-back-button').removeClass('display-none');
        }
        
    });
    
    return NavigationView;
    
});