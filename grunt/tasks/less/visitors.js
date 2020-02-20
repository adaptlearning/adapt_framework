'use strict';

var ReplaceUrls = require('./replaceUrls');

class LessPluginPreprocess {

  constructor(options) {
    this.minVersion = [2, 1, 0];
    this._replaceUrlsHandler = new ReplaceUrls(options);
  }

  install(less, pluginManager) {
    pluginManager.addVisitor(this._replaceUrlsHandler);
  }

  flushLog() {
    this._replaceUrlsHandler.flushLog();
  }

};

module.exports = LessPluginPreprocess;
