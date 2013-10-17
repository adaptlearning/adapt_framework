define(["coreJS/adapt"], function(Adapt) {
    
    Adapt.register('router', 'router', {
        initialize: function() {
        },
        routes: {
            "":"menu",
            "page":"page"
        },
        menu: function() {
            console.log('running a menu from router');
        },
        page: function() {
            console.log('running a page from router');
        }
    });
    
    var Router = Adapt.create('router', 'router');
    
    return Router
    
});