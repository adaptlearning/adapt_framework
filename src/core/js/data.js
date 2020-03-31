define([
  'core/js/adapt',
  'core/js/collections/adaptCollection',
  'core/js/models/articleModel',
  'core/js/models/blockModel',
  'core/js/models/configModel',
  'core/js/models/menuModel',
  'core/js/models/pageModel',
  'core/js/models/componentModel',
  'core/js/models/courseModel',
  'core/js/models/questionModel',
  'core/js/models/lockingModel',
  'core/js/models/buildModel',
  'core/js/startController'
], function(Adapt, AdaptCollection, ArticleModel, BlockModel, ConfigModel, MenuModel, PageModel, ComponentModel, CourseModel, QuestionModel) {

  class Data extends Backbone.Controller {

    initialize() {
      this.mappedIds = {};
    }

    init () {
      Adapt.build.whenReady().then(this.onBuildDataLoaded.bind(this));
    }

    onBuildDataLoaded() {
      $('html').attr('data-adapt-framework-version', Adapt.build.get('package').version);
      Adapt.config = new ConfigModel(null, { url: 'course/config.' + Adapt.build.get('jsonext'), reset: true });
      this.listenTo(Adapt.config, {
        'change:_activeLanguage': this.onLanguageChange,
        'change:_defaultDirection': this.onDirectionChange
      });

      // Events that are triggered by the main Adapt content collections and models
      this.listenToOnce(Adapt, 'configModel:loadCourseData', this.onLoadCourseData);
    }

    onLanguageChange(model, language) {
      Adapt.offlineStorage.set('lang', language);
      this.loadCourseData(this.triggerDataReady.bind(this), language);
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
      if (Adapt.config.get('_activeLanguage')) {
        this.loadCourseData(this.triggerDataReady.bind(this));
      } else {
        Adapt.config.set('_activeLanguage', Adapt.config.get('_defaultLanguage'));
      }
    }

    loadCourseData(callback, newLanguage) {
      this.listenTo(Adapt, 'adaptCollection:dataLoaded courseModel:dataLoaded', () => {
        this.checkDataIsLoaded(callback, newLanguage);
      });

      // All code that needs to run before adapt starts should go here
      const language = Adapt.config.get('_activeLanguage');
      const jsonext = Adapt.build.get('jsonext');
      const courseFolder = 'course/' + language + '/';

      $('html').attr('lang', language);

      Adapt.course = new CourseModel(null, { url: courseFolder + 'course.' + jsonext, reset: true });

      Adapt.contentObjects = new AdaptCollection(null, {
        model: json => {
          switch (json._type) {
            case 'page':
              return new PageModel(json);
            case 'menu':
              return new MenuModel(json);
          }
        },
        url: courseFolder + 'contentObjects.' + jsonext
      });

      Adapt.articles = new AdaptCollection(null, {
        model: ArticleModel,
        url: courseFolder + 'articles.' + jsonext
      });

      Adapt.blocks = new AdaptCollection(null, {
        model: BlockModel,
        url: courseFolder + 'blocks.' + jsonext
      });

      Adapt.components = new AdaptCollection(null, {
        model: json => {

          // use view+model object
          const ViewModelObject = Adapt.componentStore[json._component];

          if (!ViewModelObject) {
            throw new Error('One or more components of type "' + json._component + '" were included in the course - but no component of that type is installed...');
          }

          // if model defined for component use component model
          if (ViewModelObject.model) {
            // eslint-disable-next-line new-cap
            return new ViewModelObject.model(json);
          }

          const View = ViewModelObject.view || ViewModelObject;
          // if question type use question model
          if (View._isQuestionType) {
            return new QuestionModel(json);
          }

          // otherwise use component model
          return new ComponentModel(json);
        },
        url: courseFolder + 'components.' + jsonext
      });
    }

    checkDataIsLoaded(callback, newLanguage) {
      if (Adapt.contentObjects.models.length > 0 &&
        Adapt.articles.models.length > 0 &&
        Adapt.blocks.models.length > 0 &&
        Adapt.components.models.length > 0 &&
        Adapt.course.get('_id')) {

        this.mapAdaptIdsToObjects();

        Adapt.log.debug('Firing app:dataLoaded');

        try {
          Adapt.trigger('app:dataLoaded');// Triggered to setup model connections in AdaptModel.js
        } catch (e) {
          Adapt.log.error('Error during app:dataLoading trigger', e);
        }

        this.setupMapping();

        Adapt.wait.queue(() => {
          callback(newLanguage);
        });

      }
    }

    mapAdaptIdsToObjects() {
      Adapt.contentObjects._byAdaptID = Adapt.contentObjects.groupBy('_id');
      Adapt.articles._byAdaptID = Adapt.articles.groupBy('_id');
      Adapt.blocks._byAdaptID = Adapt.blocks.groupBy('_id');
      Adapt.components._byAdaptID = Adapt.components.groupBy('_id');
    }

    setupMapping() {
      this.mappedIds = {};

      // Setup course Id
      this.mappedIds[Adapt.course.get('_id')] = 'course';

      const collections = ['contentObjects', 'articles', 'blocks', 'components'];

      collections.forEach(collection => {
        Adapt[collection].models.forEach(model => {
          const id = model.get('_id');
          this.mappedIds[id] = collection;
        });
      });
    }

    triggerDataReady(newLanguage) {
      if (newLanguage) {

        Adapt.trigger('app:languageChanged', newLanguage);

        _.defer(() => {
          Adapt.startController.loadCourseData();
          let hash = '#/';

          if (Adapt.startController.isEnabled()) {
            hash = Adapt.startController.getStartHash(true);
          }

          Backbone.history.navigate(hash, { trigger: true, replace: true });
        });
      }

      Adapt.log.debug('Firing app:dataReady');

      try {
        Adapt.trigger('app:dataReady');
      } catch (e) {
        Adapt.log.error('Error during app:dataReady trigger', e);
      }

      Adapt.wait.queue(this.triggerInit.bind(this));

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
     * Looks up which collection a model belongs to
     * @param {string} id The id of the item you want to look up e.g. `"co-05"`
     * @return {string} One of the following (or `undefined` if not found):
     * - "course"
     * - "contentObjects"
     * - "blocks"
     * - "articles"
     * - "components"
     */
    mapById(id) {
      return this.mappedIds[id];
    }

    /**
     * Looks up a model by its `_id` property
     * @param {string} id The id of the item e.g. "co-05"
     * @return {Backbone.Model}
     */
    findById(id) {
      if (id === Adapt.course.get('_id')) {
        return Adapt.course;
      }

      const collectionType = Adapt.mapById(id);

      if (!collectionType) {
        console.warn('Adapt.findById() unable to find collection type for id: ' + id);
        return;
      }

      return Adapt[collectionType]._byAdaptID[id][0];
    }

  }

  return (Adapt.data = new Data());

});
