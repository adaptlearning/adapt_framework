/*globals define*/
require([
    'coreJS/adapt',
    'coreViews/navigationView',
    'templates',
    'components/components', 
    'extensions/extensions', 
    'menus/menu', 
    'themes/theme'
], function (Adapt, NavigationView) {
    
    console.log(Adapt);
    
    // All code that needs to run before adapt starts should go here
    
    new NavigationView();
    
    Adapt.initialize();
    
});
