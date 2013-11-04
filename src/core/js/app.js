/*
* Adapt
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Daryl Hedley, Fabien O'Carroll, Chris Jones
*/
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
    
    Adapt.initialize();
    
});
