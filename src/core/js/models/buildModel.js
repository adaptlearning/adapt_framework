import Adapt from 'core/js/adapt';
import LockingModel from 'core/js/models/lockingModel';
import 'core/js/logging';
import semver from 'semver';

export default class BuildModel extends LockingModel {

  defaults() {
    return {
      jsonext: 'json'
    };
  }

  initialize(attrs, options) {
    this.url = options.url;
    // Fetch data & if successful trigger event to enable plugins to stop course files loading
    // Then check if course files can load
    // 'configModel:loadCourseData' event starts the core content collections and models being fetched
    this.fetch({
      success: () => {
        this.isLoaded = true;
        Adapt.trigger('buildModel:dataLoaded');
      },
      error: () => {
        console.log('Unable to load adapt/js/build.js');
        Adapt.trigger('buildModel:dataLoaded');
      }
    });
  }

  isFrameworkVersion(version) {
    return semver.satisfies(this.get('package').version, version, { includePrerelease: true });
  }

  isPluginInstalled(name, version = '*') {
    const plugin = this.get('plugins').find(plugin => {
      if (plugin.name !== name) return false;
      return semver.satisfies(plugin.version, version, { includePrerelease: true });
    });
    return Boolean(plugin);
  }

  whenReady() {
    if (this.isLoaded) return Promise.resolve();
    return new Promise(resolve => {
      Adapt.once('buildModel:dataLoaded', resolve);
    });
  }

}
