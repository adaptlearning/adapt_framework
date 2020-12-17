import Adapt from 'core/js/adapt';
import Data from 'core/js/data';
import AdaptSubsetCollection from 'core/js/collections/adaptSubsetCollection';
import ContentObjectModel from 'core/js/models/contentObjectModel';
import ArticleModel from 'core/js/models/articleModel';
import BlockModel from 'core/js/models/blockModel';
import ComponentModel from 'core/js/models/componentModel';

import 'core/js/models/courseModel';
import 'core/js/models/menuModel';
import 'core/js/models/pageModel';
import 'core/js/views/pageView';
import 'core/js/views/articleView';
import 'core/js/views/blockView';

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

export default (Adapt.mpabc = new MPABC());
