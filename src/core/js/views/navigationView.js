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
            Adapt.trigger('navigationView:preRender', this);
            this.render();
            Adapt.trigger('navigationView:postRender', this);
        },
        
        events: {
            'click a':'triggerEvent'
        },
        
        render: function() {
            var template = Handlebars.templates[this.template]
            this.$el.html(template).appendTo('#wrapper');
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
    
    return new NavigationView;
    
});