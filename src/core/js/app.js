/*
* App
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Daryl Hedley, Fabien O'Carroll, Chris Jones
*/

require([
    'coreJS/adapt',
    'coreJS/router',
    'coreJS/manager',
    'coreViews/navigationView',
    'coreJS/adaptCollection',
    'coreModels/courseModel',
    'coreModels/contentObjectModel',
    'coreModels/articleModel',
    'coreModels/blockModel',
    'coreModels/componentModel',
    'templates',
    'components/components', 
    'extensions/extensions', 
    'menu/menu', 
    'theme/theme'
], function (Adapt, Router, Manager, NavigationView, AdaptCollection, CourseModel, ContentObjectModel, ArticleModel, BlockModel, ComponentModel) {
    
    Adapt.on('adaptCollection:dataLoaded courseModel:dataLoaded', checkDataIsLoaded);
    
    // All code that needs to run before adapt starts should go here
    Adapt.course = new CourseModel({url:"course/en/course.json"});
    
    Adapt.contentObjects = new AdaptCollection(null, {
        model: ContentObjectModel, 
        url: "course/en/contentObjects.json"
    });
    
    Adapt.articles = new AdaptCollection(null, {
        model: ArticleModel, 
        url: "course/en/articles.json"
    });
    
    Adapt.blocks = new AdaptCollection(null, {
        model: BlockModel, 
        url: "course/en/blocks.json"
    });
    
    Adapt.components = new AdaptCollection(null, {
        model: ComponentModel, 
        url: "course/en/components.json"
    });
    
    new Manager();
    
    function checkDataIsLoaded() {
        if (Adapt.contentObjects.models.length > 0 
            && Adapt.articles.models.length > 0 
            && Adapt.blocks.models.length > 0 
            && Adapt.components.models.length > 0 
            && Adapt.course.hasChanged()) {
            Adapt.trigger('app:dataReady');
            Adapt.initialize();
            Adapt.off('adaptCollection:dataLoaded');
        }
    }
    
});
