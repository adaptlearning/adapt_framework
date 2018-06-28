require([
    'core/js/adapt',
    'core/js/adaptCollection',
    'core/js/startController',
    'core/js/models/buildModel',
    'core/js/models/articleModel',
    'core/js/models/blockModel',
    'core/js/models/configModel',
    'core/js/models/contentObjectModel',
    'core/js/models/componentModel',
    'core/js/models/courseModel',
    'core/js/models/questionModel',
    'core/js/views/navigationView',
    'core/js/accessibility',
    'core/js/offlineStorage',
    'core/js/logging',
    'core/js/tracking',
    'core/js/device',
    'core/js/drawer',
    'core/js/notify',
    'core/js/popupManager',
    'core/js/router',
    'core/js/models/lockingModel',
    'core/js/helpers',
    'plugins'
], function (Adapt, AdaptCollection, StartController, BuildModel, ArticleModel, BlockModel, ConfigModel, ContentObjectModel, ComponentModel, CourseModel, QuestionModel, NavigationView) {

    // Append loading template and show
    window.Handlebars = _.extend(require("handlebars"), window.Handlebars);

    var template = Handlebars.templates['loading'];
    $('#wrapper').append(template());

    Adapt.build = new BuildModel(null, {url: "adapt/js/build.min.js", reset:true});

    // This function is called anytime a course object is loaded
    // Once all course files are loaded trigger events and call Adapt.initialize
    Adapt.checkDataIsLoaded = function(newLanguage) {
        if (Adapt.contentObjects.models.length > 0 &&
            Adapt.articles.models.length > 0 &&
            Adapt.blocks.models.length > 0 &&
            Adapt.components.models.length > 0 &&
            Adapt.course.get('_id')) { 

            mapAdaptIdsToObjects();

            Adapt.log.debug('Firing app:dataLoaded');

            try {
                Adapt.trigger('app:dataLoaded');// Triggered to setup model connections in AdaptModel.js
            } catch(e) {
                Adapt.log.error('Error during app:dataLoading trigger', e);
            }

            Adapt.setupMapping();

            Adapt.wait.queue(function() {
                triggerDataReady(newLanguage);
            });

        }
    };

    function triggerDataReady(newLanguage) {
        if (newLanguage) {

            Adapt.trigger('app:languageChanged', newLanguage);

            _.defer(function() {
                var startController = new StartController();
                var hash = '#/';

                if (startController.isEnabled()) {
                    hash = startController.getStartHash(true);
                }

                Backbone.history.navigate(hash, { trigger: true, replace: true });
            });
        }

        Adapt.log.debug('Firing app:dataReady');

        try {
            Adapt.trigger('app:dataReady');
        } catch(e) {
            Adapt.log.error('Error during app:dataReady trigger', e);
        }

        Adapt.wait.queue(triggerInitialize);

    }

    function triggerInitialize() {
        Adapt.log.debug('Calling Adapt.initialize');

        addNavigationBar();

        Adapt.initialize();

        Adapt.off('adaptCollection:dataLoaded courseModel:dataLoaded');
    }

    function addNavigationBar() {

        var adaptConfig = Adapt.course.get("_navigation");

        if (adaptConfig && adaptConfig._isDefaultNavigationDisabled) {
            Adapt.trigger("navigation:initialize");
            return;
        }

        Adapt.navigation = new NavigationView();// This should be triggered after 'app:dataReady' as plugins might want to manipulate the navigation

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
    Adapt.loadCourseData = function(newLanguage) {
        Adapt.on('adaptCollection:dataLoaded courseModel:dataLoaded', function() {
            Adapt.checkDataIsLoaded(newLanguage);
        });

        // All code that needs to run before adapt starts should go here
        var language = Adapt.config.get('_activeLanguage');
        var jsonext = Adapt.build.get("jsonext");
        var courseFolder = "course/" + language +"/";

        $('html').attr("lang", language);

        Adapt.course = new CourseModel(null, {url:courseFolder + "course."+jsonext, reset:true});

        Adapt.contentObjects = new AdaptCollection(null, {
            model: ContentObjectModel,
            url: courseFolder +"contentObjects."+jsonext
        });

        Adapt.articles = new AdaptCollection(null, {
            model: ArticleModel,
            url: courseFolder + "articles."+jsonext
        });

        Adapt.blocks = new AdaptCollection(null, {
            model: BlockModel,
            url: courseFolder + "blocks."+jsonext
        });

        Adapt.components = new AdaptCollection(null, {
            model: function(json) {

                //use view+model object
                var ViewModelObject = Adapt.componentStore[json._component];

                if(!ViewModelObject) {
                    throw new Error(json._component + ' component not found. Is it installed and included?');
                }

                //if model defined for component use component model
                if (ViewModelObject.model) {
                    return new ViewModelObject.model(json);
                }

                var View = ViewModelObject.view || ViewModelObject;
                //if question type use question model
                if (View._isQuestionType) {
                    return new QuestionModel(json);
                }

                //otherwise use component model
                return new ComponentModel(json);
            },
            url: courseFolder + "components."+jsonext
        });
    };

    function onLanguageChange(model, language) {
        Adapt.offlineStorage.set('lang', language);
        Adapt.loadCourseData(language);
    }

    function onDirectionChange(model, direction) {
        if (direction === 'rtl') {
            $('html').removeClass('dir-ltr').addClass('dir-rtl').attr('dir', 'rtl');
        } else {
            $('html').removeClass('dir-rtl').addClass('dir-ltr').attr('dir', 'ltr');
        }
    }

    /**
    * Before we actually go to load the course data, we first need to check to see if a language has been set
    * If it has we can go ahead and start loading; if it hasn't, apply the defaultLanguage from config.json
    */
    function onLoadCourseData() {
        if (Adapt.config.get('_activeLanguage')) {
            Adapt.loadCourseData();
        } else {
            Adapt.config.set('_activeLanguage', Adapt.config.get('_defaultLanguage'));
        }
    }

    function onBuildDataLoaded() {
        $('html').attr("data-adapt-framework-version", Adapt.build.get('package').version);  
        Adapt.config = new ConfigModel(null, {url: "course/config."+Adapt.build.get("jsonext"), reset:true});
        Adapt.config.on({
            'change:_activeLanguage': onLanguageChange,
            'change:_defaultDirection': onDirectionChange
        });

        // Events that are triggered by the main Adapt content collections and models
        Adapt.once('configModel:loadCourseData', onLoadCourseData);

    }

    Adapt.once('buildModel:dataLoaded', onBuildDataLoaded);

});
