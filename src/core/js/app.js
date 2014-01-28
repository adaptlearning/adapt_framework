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

    Adapt.on('adaptCollection:dataLoaded courseModel:dataLoaded configModel:dataLoaded', checkDataIsLoaded);
    
    // All code that needs to run before adapt starts should go here    
    Adapt.config = new ConfigModel({url:"course/config.json"});

    var courseFolder = "course/" + Adapt.config.get('_defaultLanguage')+"/";

    Adapt.course = new CourseModel({url:courseFolder + "course.json"});
    
    Adapt.contentObjects = new AdaptCollection(null, {
        model: ContentObjectModel,
        url: courseFolder +"contentObjects.json"
    });
    
    Adapt.articles = new AdaptCollection(null, {
        model: ArticleModel,
        url: courseFolder + "articles.json"
    });
    
    Adapt.blocks = new AdaptCollection(null, {
        model: BlockModel,
        url: courseFolder + "blocks.json"
    });
    
    Adapt.components = new AdaptCollection(null, {
        model: ComponentModel,
        url: courseFolder + "components.json"
    });
    
    function checkDataIsLoaded() {
        if (Adapt.contentObjects.models.length > 0
            && Adapt.articles.models.length > 0
            && Adapt.blocks.models.length > 0
            && Adapt.components.models.length > 0
            && Adapt.config.hasChanged()
            && Adapt.course.hasChanged()) {
            Adapt.trigger('app:dataReady');
            Adapt.initialize();
            Adapt.off('adaptCollection:dataLoaded courseModel:dataLoaded configModel:dataLoaded');
        }
    }
    
});