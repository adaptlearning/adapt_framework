define(["coreJS/adapt"], function(Adapt) {
    
    Adapt.register('nav', 'view', {
        
        initialize: function() {
            this.render();
        },
        
        render: function() {
            console.log('Nav view render');
        }
        
    });
    
});

/*ADAPT.register('nav', 'view', {
    initialize: function() {
        console.log('Nav View created');
    }
});

//ADAPT.Require('nav', 'view');*/