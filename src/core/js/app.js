require([
    'core/js/adapt',
    'core/js/views/navigationView',
    'core/js/accessibility',
    'core/js/data',
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
], function (Adapt, NavigationView) {

    // Append loading template and show
    window.Handlebars = _.extend(require('handlebars'), window.Handlebars);

    var template = Handlebars.templates['loading'];
    $('body').append(template());


    Adapt.data.whenReady().then(function triggerInit() {
        Adapt.log.debug('Calling Adapt.init');

        addNavigationBar();

        Adapt.init();

        Adapt.off('adaptCollection:dataLoaded courseModel:dataLoaded');
    });

    function addNavigationBar() {

        var adaptConfig = Adapt.course.get('_navigation');

        if (adaptConfig && adaptConfig._isDefaultNavigationDisabled) {
            Adapt.trigger('navigation:initialize');
            return;
        }

        Adapt.navigation = new NavigationView();// This should be triggered after 'app:dataReady' as plugins might want to manipulate the navigation

    }

});
