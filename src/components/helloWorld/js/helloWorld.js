define(["coreJS/adapt", "templates"], function(Adapt) {
    
    Adapt.register('helloWorld', 'view', {
        
        el: "#wrapper",
        
        initialize: function() {
            this.render();
        },
        
        render: function() {
            var data = {"title":"Hello World"};
            var template = Handlebars.templates["helloWorld"];
            this.$el.append(template(data));
            return this;
        }
        
    });
    
    
})