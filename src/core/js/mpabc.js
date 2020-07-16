define([
  'core/js/adapt',
  'core/js/data',
  'core/js/collections/adaptSubsetCollection',
  'core/js/models/courseModel',
  'core/js/models/contentObjectModel',
  'core/js/models/menuModel',
  'core/js/models/pageModel',
  'core/js/models/articleModel',
  'core/js/models/blockModel',
  'core/js/models/componentModel',
  'core/js/views/pageView',
  'core/js/views/articleView',
  'core/js/views/blockView'
], function(Adapt, Data, AdaptSubsetCollection, CourseModel, ContentObjectModel, MenuModel, PageModel, ArticleModel, BlockModel, ComponentModel, PageView, ArticleView, BlockView) {

  class MPABC extends Backbone.Controller {

    initialize() {
      // Example of how to cause the data loader to wait for another module to setup
      this.listenTo(Data, {
        loading: this.waitForDataLoaded,
        loaded: this.onDataLoaded
      });
      this.setupDeprecatedSubsetCollections();
    }

    waitForDataLoaded() {
      // Tell the data loader to wait
      Adapt.wait.begin();
    }

    onDataLoaded() {
      // Tell the data loader that we have finished
      Adapt.wait.end();
    }

    setupDeprecatedSubsetCollections() {
      let contentObjects = new AdaptSubsetCollection(null, { parent: Data, model: ContentObjectModel });
      let articles = new AdaptSubsetCollection(null, { parent: Data, model: ArticleModel });
      let blocks = new AdaptSubsetCollection(null, { parent: Data, model: BlockModel });
      let components = new AdaptSubsetCollection(null, { parent: Data, model: ComponentModel });
      Object.defineProperty(Adapt, 'contentObjects', {
        get: () => {
          Adapt.log.deprecated('Adapt.contentObjects, please use Adapt.data instead');
          return contentObjects;
        },
        set: value => (contentObjects = value)
      });
      Object.defineProperty(Adapt, 'articles', {
        get: () => {
          Adapt.log.deprecated('Adapt.articles, please use Adapt.data instead');
          return articles;
        },
        set: value => (articles = value)
      });
      Object.defineProperty(Adapt, 'blocks', {
        get: () => {
          Adapt.log.deprecated('Adapt.blocks, please use Adapt.data instead');
          return blocks;
        },
        set: value => (blocks = value)
      });
      Object.defineProperty(Adapt, 'components', {
        get: () => {
          Adapt.log.deprecated('Adapt.components, please use Adapt.data instead');
          return components;
        },
        set: value => (components = value)
      });
    }

  }

  return (Adapt.mpabc = new MPABC());

});
