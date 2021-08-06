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

  /**
   * Parse the incoming search queries for certain parameter values to use as defaults
   */
  setValuesFromURLParams() {
    const paramMappings = {
      dir: '_defaultDirection',
      lang: '_activeLanguage'
    };

    const params = new URLSearchParams(window.location.search);

    Object.entries(paramMappings).forEach(([key, value]) => {
      const passedVal = params.get(key);
      if (!passedVal) return;
      this.set(value, passedVal);
    });
  }

  initialize(attrs, options) {
    this.url = options.url;
    // Fetch data & if successful trigger event to enable plugins to stop course files loading
    // Then check if course files can load
    // 'configModel:loadCourseData' event starts the core content collections and models being fetched
    this.fetch({
      success: () => {
        this.setValuesFromURLParams();

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
