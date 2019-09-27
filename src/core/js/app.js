require([
  'core/js/adapt',
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
  'core/js/navigation',
  'plugins'
], function (Adapt) {

  $('body').append(Handlebars.templates.loading());

  Adapt.data.on('ready', function triggerInit() {
    Adapt.log.debug('Calling Adapt.init');

    Adapt.init();

    Adapt.off('adaptCollection:dataLoaded courseModel:dataLoaded');
  }).init();

});
