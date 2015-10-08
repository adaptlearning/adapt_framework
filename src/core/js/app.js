require([
    'coreJS/adapt',
    'coreJS/router',
    'coreJS/drawer',
    'coreJS/device',
    'coreJS/popupManager',
    'coreJS/notify',
    'coreJS/accessibility',
    'coreViews/navigationView',
    'coreJS/adaptCollection',
    'coreModels/configModel',
    'coreModels/courseModel',
    'coreModels/contentObjectModel',
    'coreModels/articleModel',
    'coreModels/blockModel',
    'coreModels/componentModel',
    'coreJS/offlineStorage',
    'coreModels/lockingModel',
    'velocity',
    'imageReady',
    'inview',
    'handlebars',
    'templates',
    'jquery',
    'scrollTo',
    'components/components',
    'extensions/extensions',
    'menu/menu',
    'theme/theme'
], function (Adapt, Router, Drawer, Device, PopupManager, Notify, Accessibility, NavigationView, AdaptCollection, ConfigModel, CourseModel, ContentObjectModel, ArticleModel, BlockModel, ComponentModel) {

    // Append loading template and show
    window.Handlebars = _.extend(require("handlebars"), window.Handlebars)

    var template = Handlebars.templates['loading'];
    $('#wrapper').append(template());

    // Create config model
    Adapt.config = new ConfigModel(null, {url: "course/config.json", reset:true});

    // This function is called anytime a course object is loaded
    // Once all course files are loaded trigger events and call Adapt.initialize
    function checkDataIsLoaded() {
        if (Adapt.contentObjects.models.length > 0
            && Adapt.articles.models.length > 0
            && Adapt.blocks.models.length > 0
            && Adapt.components.models.length > 0
            && Adapt.course.get('_id')) {

            mapAdaptIdsToObjects();

            if (typeof Adapt.course.get('_buttons').submit !== 'undefined') {
                // Backwards compatibility with v1.x
                var oldButtons = Adapt.course.get('_buttons');
                var buttons = [];

                for (var key in oldButtons) {
                    buttons['_' + key] = {
                        buttonText: oldButtons[key],
                        ariaLabel: oldButtons[key]
                    };
                }

                // HACK - Append other missing values
                buttons['_showFeedback'] = {
                    buttonText: 'Show feedback',
                    ariaLabel: 'Show feedback'
                };

                // Replace the existing property
                Adapt.course.set('_buttons', buttons);
            }

            // Triggered to setup model connections in AdaptModel.js
            Adapt.trigger('app:dataLoaded');
            // Sets up collection mapping
            Adapt.setupMapping();
            // Triggers once all the data is ready
            Adapt.trigger('app:dataReady');
            // Setups a new navigation view
            // This should be triggered after 'app:dataReady' as plugins might want
            // to manipulate the navigation
            new NavigationView();
            // Called once Adapt is ready to begin
            Adapt.initialize();
            // Remove event listeners
            Adapt.off('adaptCollection:dataLoaded courseModel:dataLoaded');

        }
    }

    function mapAdaptIdsToObjects () {
        Adapt.contentObjects._byAdaptID = Adapt.contentObjects.groupBy("_id");
        Adapt.articles._byAdaptID = Adapt.articles.groupBy("_id");
        Adapt.blocks._byAdaptID = Adapt.blocks.groupBy("_id");
        Adapt.components._byAdaptID = Adapt.components.groupBy("_id");
    }

    // This function is called when the config model triggers 'configModel:loadCourseData'
    // Once the config model is loaded get the course files
    // This enables plugins to tap in before the course files are loaded & also to change the default language
    function loadCourseData() {
        // All code that needs to run before adapt starts should go here
        var language = Adapt.config.get('_defaultLanguage');

        var courseFolder = "course/" + language +"/";

        $('html').attr("lang", language);

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
    Adapt.once('configModel:loadCourseData', loadCourseData);

    Adapt.on('adaptCollection:dataLoaded courseModel:dataLoaded', checkDataIsLoaded);

});
