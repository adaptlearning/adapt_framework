/*
* App
* License - https://github.com/adaptlearning/adapt_framework/blob/master/LICENSE
* Maintainers - Daryl Hedley, Fabien O'Carroll, Chris Jones
*/

require([
    'coreModels/backboneModel',
    'coreJS/adapt',
    'coreJS/router',
    'coreJS/device',
    'coreJS/popupManager',
    'coreJS/notify',
    'coreViews/navigationView',
    'coreJS/adaptCollection',
    'coreModels/configModel',
    'coreModels/courseModel',
    'coreModels/contentObjectModel',
    'coreModels/articleModel',
    'coreModels/blockModel',
    'coreModels/componentModel',
    'templates',
    'velocity',
    'imageReady',
    'inview',
    'scrollTo',
    'components/components',
    'extensions/extensions',
    'menu/menu',
    'theme/theme'
], function (BackboneModel, Adapt, Router, Device, PopupManager, Notify, NavigationView, AdaptCollection, ConfigModel, CourseModel, ContentObjectModel, ArticleModel, BlockModel, ComponentModel) {
    
    // Append loading template and show
    var template = Handlebars.templates['loading'];
    $('#wrapper').append(template());

    // Create config model
    // Passing in reset:true means the lockedAttributes get by-passed on load
    Adapt.config = new ConfigModel(null, {url: "course/config.json", reset:true});

    // This function is called anytime a course object is loaded
    // Once all course files are loaded trigger events and call Adapt.initialize
    function checkDataIsLoaded() {
        if (Adapt.contentObjects.models.length > 0
            && Adapt.articles.models.length > 0
            && Adapt.blocks.models.length > 0
            && Adapt.components.models.length > 0
            && Adapt.course.hasChanged()) {
            Adapt.trigger('app:dataReady');
            Adapt.initialize();
            Adapt.off('adaptCollection:dataLoaded courseModel:dataLoaded configModel:dataLoaded');
        }
    }

    // This function is called when the config model triggers 'configModel:loadCourseData'
    // Once the config model is loaded get the course files
    // This enables plugins to tap in before the course files are loaded & also to change the default language
    function loadCourseData() {
        // All code that needs to run before adapt starts should go here    
        var courseFolder = "course/" + Adapt.config.get('_defaultLanguage')+"/";

        Adapt.course = new CourseModel(null, {url:courseFolder + "course.json", reset:true});
        
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
    }

    // Events that are triggered by the main Adapt content collections and models
    Adapt.on('configModel:loadCourseData', loadCourseData);

    Adapt.on('adaptCollection:dataLoaded courseModel:dataLoaded', checkDataIsLoaded);
    
    
    
    
    
});