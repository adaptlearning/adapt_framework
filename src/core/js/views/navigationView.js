define(["backbone", "handlebars", "coreJS/adapt"], function(Backbone, Handlebars, Adapt) {
    
    var NavigationView = Backbone.View.extend({
        
        className: "navigation",
        
        initialize: function() {
            this.template = "navigation";
            Adapt.trigger('navigation:preRender');
            this.render();
            Adapt.trigger('navigation:postRender');
        },
        
        events: {
            'click a':'triggerEvent'
        },
        
        render: function() {
            var template = Handlebars.templates[this.template]
            $(this.el).html(template).appendTo('#wrapper');
            return this;
        },
        
        triggerEvent: function(event) {
            event.preventDefault();
            var currentEvent = $(event.currentTarget).attr('data-event');
            Adapt.trigger('navigation:' + currentEvent);
        }
        
    });
    
    return NavigationView;
    
});