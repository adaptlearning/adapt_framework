"use strict";

var getReplaceUrls = require("./replaceUrls");

class LessPluginPreprocess {

    constructor (options) {
        this.minVersion = [2, 1, 0];
        this._options = options;
    }

    install (less, pluginManager) {
        var ReplaceUrls = getReplaceUrls(less);
        pluginManager.addVisitor(new ReplaceUrls(this._options));
    }

};

module.exports = LessPluginPreprocess;