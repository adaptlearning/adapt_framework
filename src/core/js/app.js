import Adapt from 'core/js/adapt';
import 'core/js/templates';
import 'core/js/fixes';
import 'core/js/accessibility';
import 'core/js/data';
import 'core/js/offlineStorage';
import 'core/js/logging';
import 'core/js/tracking';
import 'core/js/device';
import 'core/js/drawer';
import 'core/js/notify';
import 'core/js/router';
import 'core/js/models/lockingModel';
import 'core/js/mpabc';
import 'core/js/helpers';
import 'core/js/scrolling';
import 'core/js/headings';
import 'core/js/navigation';
import 'plugins';

$('body').append(Handlebars.templates.loading());

Adapt.data.on('ready', function triggerInit() {
  Adapt.log.debug('Calling Adapt.init');

  Adapt.init();

  Adapt.off('adaptCollection:dataLoaded courseModel:dataLoaded');
}).init();
