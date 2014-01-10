/*
* App
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Daryl Hedley, Fabien O'Carroll, Chris Jones
*/

require([
    'coreJS/adapt',
    'coreJS/mediator',
    'coreJS/router',
    'coreJS/device',
    'coreViews/navigationView',
    'coreJS/adaptCollection',
    'coreModels/configModel',
    'coreModels/courseModel',
    'coreModels/contentObjectModel',
    'coreModels/articleModel',
    'coreModels/blockModel',
    'coreModels/componentModel',
    'templates',
    'imageReady',
    'inview',
    'scrollTo',
    'components/components', 
    'extensions/extensions', 
    'menu/menu', 
    'theme/theme'
], function (Adapt, Mediator, Router, Device, NavigationView, AdaptCollection, ConfigModel, CourseModel, ContentObjectModel, ArticleModel, BlockModel, ComponentModel) {
    
    var template = Handlebars.templates['loading'];
    $('#wrapper').append(template());

    Adapt.on('configModel:dataLoaded', checkDataIsLoaded);
    Adapt.on('adaptCollection:dataLoaded courseModel:dataLoaded', checkDataIsLoaded);
    
    // All code that needs to run before adapt starts should go here    
    Adapt.config = new ConfigModel({url:"course/config.json"});

    Adapt.course = new CourseModel({url:"course/" + Adapt.config.get('_defaultLanguage') + "/course.json"});
    
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
    
    function checkDataIsLoaded() {
        if (Adapt.contentObjects.models.length > 0 
            && Adapt.articles.models.length > 0 
            && Adapt.blocks.models.length > 0             
            && Adapt.components.models.length > 0
            && Adapt.config !== null 
            && Adapt.course.hasChanged()) {
            Adapt.trigger('app:dataReady');
            Adapt.initialize();
            Adapt.off('adaptCollection:dataLoaded');
        }
    }
    
});
