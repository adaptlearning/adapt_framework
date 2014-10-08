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
            this.listenTo(Adapt, 'router:menu router:page', this.toggleNavigationButtonVisibility);
            this.listenTo(Adapt, 'navigation:menuButton', this.navigateToParentMenu);
            this.template = "navigation";
            this.preRender();
        },
        
        events: {
            'click a':'triggerEvent'
        },

        preRender: function() {
            Adapt.trigger('navigationView:preRender', this);
            this.render();
        },
        
        render: function() {
            var template = Handlebars.templates[this.template];
            var data = {
                config: Adapt.course.get('_navigation'),
                aria: Adapt.course.get('_accessibility')._ariaLabels
            };
            this.$el.html(template(data)).appendTo('#wrapper');
            _.defer(_.bind(function() {
                Adapt.trigger('navigationView:postRender', this);
                this.addConfigClasses();
            }, this));
            return this;
        },
        
        addConfigClasses: function() {
            var config = Adapt.course.get('_navigation');
            if (config._showIconBorders) {
                this.$el.addClass("show-icon-border");
            }
            if (config._showAllTooltipsOnHover) {
                this.$el.addClass("show-all-tooltips-hover");
            }
            if (config._tooltipsAlwaysVisible) {
                this.$el.addClass("tooltips-always-visible");
            }
        },
        
        triggerEvent: function(event) {
            event.preventDefault();
            var currentEvent = $(event.currentTarget).attr('data-event');
            Adapt.trigger('navigation:' + currentEvent);
        },

        toggleNavigationButtonVisibility: function(model) {
            if (model.get('_type') === "course") {
                $('.navigation-button').addClass('display-none');
            } else {
                this.showNavigationButton();
            }
        },

        showNavigationButton: function() {
            $('.navigation-button').removeClass('display-none');
        },

        navigateToParentMenu: function() {
            var currentModel = Adapt.findById(Adapt.location._currentId);
            var parentId = currentModel.get("_parentId");
            if (parentId === "course") {
                Backbone.history.navigate("#/", {trigger: true});
            } else {
                Backbone.history.navigate("#/id/" + parentId, {trigger: true});
            }
        }
        
    });
    
    return NavigationView;
    
});