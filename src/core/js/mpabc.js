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
      this.setupSubsetCollections();
    }

    waitForDataLoaded() {
      // Tell the data loader to wait
      Adapt.wait.begin();
    }

    onDataLoaded() {
      // Tell the data loader that we have finished
      Adapt.wait.end();
    }

    setupSubsetCollections() {
      Adapt.contentObjects = new AdaptSubsetCollection(null, { parent: Data, model: ContentObjectModel });
      Adapt.articles = new AdaptSubsetCollection(null, { parent: Data, model: ArticleModel });
      Adapt.blocks = new AdaptSubsetCollection(null, { parent: Data, model: BlockModel });
      Adapt.components = new AdaptSubsetCollection(null, { parent: Data, model: ComponentModel });
    }

  }

  return (Adapt.mpabc = new MPABC());

});
