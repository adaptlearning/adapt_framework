import Adapt from 'core/js/adapt';
import AdaptCollection from 'core/js/collections/adaptCollection';
import BuildModel from 'core/js/models/buildModel';
import ConfigModel from 'core/js/models/configModel';
import LockingModel from 'core/js/models/lockingModel';

import 'core/js/models/courseModel';
import 'core/js/startController';

class Data extends AdaptCollection {

  model(json) {
    const ModelClass = Adapt.getModelClass(json);
    if (!ModelClass) {
      return new LockingModel(json);
    }
    return new ModelClass(json, { parse: true });
  }

  initialize() {
    super.initialize();
    this.on({
      'add': this.onAdded,
      'remove': this.onRemoved
    });
  }

  async init () {
    this.reset();
    this._byAdaptID = {};
    Adapt.build = new BuildModel(null, { url: 'adapt/js/build.min.js', reset: true });
    await Adapt.build.whenReady();
    $('html').attr('data-adapt-framework-version', Adapt.build.get('package').version);
    this.loadConfigData();
  }

  onAdded(model) {
    this._byAdaptID[model.get('_id')] = model;
  }

  onRemoved(model) {
    delete this._byAdaptID[model.get('_id')];
  }

  loadConfigData() {
    Adapt.config = new ConfigModel(null, { url: 'course/config.' + Adapt.build.get('jsonext'), reset: true });
    this.listenToOnce(Adapt, 'configModel:loadCourseData', this.onLoadCourseData);
    this.listenTo(Adapt.config, {
      'change:_activeLanguage': this.onLanguageChange,
      'change:_defaultDirection': this.onDirectionChange
    });
  }

  onDirectionChange(model, direction) {
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
  onLoadCourseData() {
    if (!Adapt.config.get('_activeLanguage')) {
      Adapt.config.set('_activeLanguage', Adapt.config.get('_defaultLanguage'));
      return;
    }
    this.loadCourseData();
  }

  onLanguageChange(model, language) {
    Adapt.offlineStorage.set('lang', language);
    // set `_isStarted` back to `false` when changing language so that the learner's answers
    // to questions get restored in the new language when `_restoreStateOnLanguageChange: true`
    // see https://github.com/adaptlearning/adapt_framework/issues/2977
    if (Adapt.get('_isStarted')) {
      Adapt.set('_isStarted', false);
    }
    this.loadCourseData(language);
  }

  async loadCourseData(newLanguage) {

    // All code that needs to run before adapt starts should go here
    const language = Adapt.config.get('_activeLanguage');
    const courseFolder = 'course/' + language + '/';

    $('html').attr('lang', language);

    await this.loadManifestFiles(courseFolder);
    await this.triggerDataLoaded();
    await this.triggerDataReady(newLanguage);
    this.triggerInit();

  }

  getJSON(path) {
    return new Promise((resolve, reject) => {
      $.getJSON(path, data => {
        // Add path to data in case it's necessary later
        data.__path__ = path;
        resolve(data);
      }).fail(reject);
    });
  }

  async loadManifestFiles(languagePath) {
    this.trigger('loading');
    this.reset();
    const manifestPath = languagePath + 'language_data_manifest.js';
    let manifest;
    try {
      manifest = await this.getJSON(manifestPath);
    } catch (err) {
      manifest = ['course.json', 'contentObjects.json', 'articles.json', 'blocks.json', 'components.json'];
      Adapt.log.warnOnce(`Manifest path '${manifestPath} not found. Using traditional files: ${manifest.join(', ')}`);
    }
    const allFileData = await Promise.all(manifest.map(filePath => {
      return this.getJSON(`${languagePath}${filePath}`);
    }));
    // Flatten all file data into a single array of model data
    const allModelData = allFileData.reduce((result, fileData) => {
      if (Array.isArray(fileData)) {
        result.push(...fileData);
      } else if (fileData instanceof Object) {
        result.push(fileData);
      } else {
        Adapt.log.warnOnce(`File data isn't an array or object: ${fileData.__path__}`);
      }
      return result;
    }, []);
    // Add course model first to allow other model/views to utilize its settings
    const course = allModelData.find(modelData => modelData._type === 'course');
    if (!course) {
      throw new Error(`Expected a model data with "_type": "course", none found.`);
    }
    Adapt.trigger('courseModel:dataLoading');
    Adapt.course = this.push(course);
    Adapt.trigger('courseModel:dataLoaded');
    // Add other models
    allModelData.forEach(modelData => {
      if (modelData._type === 'course') {
        return;
      }
      this.push(modelData);
    });
    this.trigger('reset');
    this.trigger('loaded');
    await Adapt.wait.queue();
  }

  async triggerDataLoaded() {
    Adapt.log.debug('Firing app:dataLoaded');
    try {
      // Setup the newly added models
      this.forEach(model => model.setupModel?.());
      Adapt.trigger('app:dataLoaded');
    } catch (e) {
      Adapt.log.error('Error during app:dataLoading trigger', e);
    }
    await Adapt.wait.queue();
  }

  async triggerDataReady(newLanguage) {
    if (newLanguage) {
      Adapt.trigger('app:languageChanged', newLanguage);
      _.defer(() => {
        Adapt.startController.loadCourseData();
        const hash = Adapt.startController.isEnabled() ? Adapt.startController.getStartHash(false) : '#/';
        Adapt.router.navigate(hash, { trigger: true, replace: true });
      });
    }
    Adapt.log.debug('Firing app:dataReady');
    try {
      Adapt.trigger('app:dataReady');
    } catch (e) {
      Adapt.log.error('Error during app:dataReady trigger', e);
    }
    await Adapt.wait.queue();
  }

  triggerInit() {
    this.isReady = true;
    this.trigger('ready');
  }

  whenReady() {
    if (this.isReady) return Promise.resolve();
    return new Promise(resolve => {
      this.once('ready', resolve);
    });
  }

  /**
   * Looks up a model by its `_id` property
   * @param {string} id The id of the item e.g. "co-05"
   * @return {Backbone.Model}
   */
  findById(id) {
    const model = this._byAdaptID[id];
    if (!model) {
      console.warn(`Adapt.findById() unable to find id: ${id}`);
      return;
    }
    return model;
  }

  /**
   * Returns the model represented by the trackingPosition.
   * @param {Array<Number, Number>} trackingPosition Represents the relative location of a model to a _trackingId
   * @returns {Backbone.Model}
   */
  findByTrackingPosition(trackingPosition) {
    const [ trackingId, indexInTrackingIdDescendants ] = trackingPosition;
    const trackingIdModel = this.find(model => model.get('_trackingId') === trackingId);
    if (!trackingIdModel) {
      console.warn(`Adapt.findByTrackingPosition() unable to find trackingPosition: ${trackingPosition}`);
      return;
    }
    if (indexInTrackingIdDescendants >= 0) {
      // Model is either the trackingId model or a descendant
      const trackingIdDescendants = [trackingIdModel].concat(trackingIdModel.getAllDescendantModels(true));
      return trackingIdDescendants[indexInTrackingIdDescendants];
    }
    // Model is an ancestor of the trackingId model
    const trackingIdAncestors = trackingIdModel.getAncestorModels();
    const ancestorDistance = Math.abs(indexInTrackingIdDescendants) - 1;
    return trackingIdAncestors[ancestorDistance];
  }

}

export default (Adapt.data = new Data());
