import Adapt from 'core/js/adapt';
import LockingModel from 'core/js/models/lockingModel';

export default class ConfigModel extends LockingModel {

  defaults() {
    return {
      screenSize: {
        large: 900,
        medium: 760,
        small: 520
      },
      _forceRouteLocking: false,
      _canLoadData: true,
      _disableAnimation: false
    };
  }

  initialize(attrs, options) {
    this.url = options.url;
    // Fetch data & if successful trigger event to enable plugins to stop course files loading
    // Then check if course files can load
    // 'configModel:loadCourseData' event starts the core content collections and models being fetched
    this.fetch({
      success: () => {
        Adapt.trigger('offlineStorage:prepare');
        Adapt.wait.queue(() => {
          Adapt.trigger('configModel:dataLoaded');
          if (!this.get('_canLoadData')) return;
          Adapt.trigger('configModel:loadCourseData');
        });
      },
      error: () => console.log('Unable to load course/config.json')
    });
  }

  loadData() {}

}
