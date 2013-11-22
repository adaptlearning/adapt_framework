define(["coreJS/router", "coreJS/adapt", "backbone", "handlebars", "coreViews/pageView"], function(Router, Adapt, Backbone, Handlebars, PageView) {
    
    var routeToPage = false;
    var routeToMenu = false;
    
    Adapt.contentObjects = new Backbone.Collection([
        {
            _id:"co-05", 
            _type:"page", 
            title: "Page"
        },
        {
            _id:"co-10", 
            _type:"menu", 
            title: "Menu"
        }
    ]);
    
    describe('Router', function() {
        
        Adapt.on('router:menu', function() {
            routeToMenu = true;
        })
        
        Router.handleId('co-10');
        
        it('should allow me load a menu based upon an id', function() {
            
            expect(routeToPage).to.be(false);
            
        });
        
    });

});