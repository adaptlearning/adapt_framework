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
    'core/js/scrolling',
    'core/js/headings',
    'plugins'
], function (Adapt, AdaptCollection, StartController, BuildModel, ArticleModel, BlockModel, ConfigModel, ContentObjectModel, ComponentModel, CourseModel, QuestionModel, NavigationView) {

    // Append loading template and show
    window.Handlebars = _.extend(require('handlebars'), window.Handlebars);

    var template = Handlebars.templates['loading'];
    $('body').append(template());

    Adapt.build = new BuildModel(null, {url: 'adapt/js/build.min.js', reset:true});

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

        Adapt.wait.queue(triggerInit);

    }

    function triggerInit() {
        Adapt.log.debug('Calling Adapt.init');

        addNavigationBar();

        Adapt.init();

        Adapt.off('adaptCollection:dataLoaded courseModel:dataLoaded');
    }

    function addNavigationBar() {

        var adaptConfig = Adapt.course.get('_navigation');

        if (adaptConfig && adaptConfig._isDefaultNavigationDisabled) {
            Adapt.trigger('navigation:initialize');
            return;
        }

        Adapt.navigation = new NavigationView();// This should be triggered after 'app:dataReady' as plugins might want to manipulate the navigation

    }

    function onLanguageChange(model, language) {
        Adapt.offlineStorage.set('lang', language);
        Adapt.loadCourseData(triggerDataReady, language);
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
            Adapt.loadCourseData(triggerDataReady);
        } else {
            Adapt.config.set('_activeLanguage', Adapt.config.get('_defaultLanguage'));
        }
    }

    function onBuildDataLoaded() {
        $('html').attr('data-adapt-framework-version', Adapt.build.get('package').version);
        Adapt.config = new ConfigModel(null, {url: 'course/config.' + Adapt.build.get('jsonext'), reset:true});
        Adapt.config.on({
            'change:_activeLanguage': onLanguageChange,
            'change:_defaultDirection': onDirectionChange
        });

        // Events that are triggered by the main Adapt content collections and models
        Adapt.once('configModel:loadCourseData', onLoadCourseData);

    }

    Adapt.once('buildModel:dataLoaded', onBuildDataLoaded);

});
