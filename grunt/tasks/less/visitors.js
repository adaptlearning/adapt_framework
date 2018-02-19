"use strict";

var getReplaceUrls = require("./replaceUrls");

class LessPluginPreprocess {

    constructor (options) {
        this.minVersion = [2, 1, 0];
        this._options = options;
    }

    install (less, pluginManager) {
        var ReplaceUrls = getReplaceUrls(less);
        this._replaceUrlsHandler = new ReplaceUrls(this._options);
        pluginManager.addVisitor(this._replaceUrlsHandler);
    }

    flushLog () {
        this._replaceUrlsHandler.flushLog();
    }

};

module.exports = LessPluginPreprocess;