const fs = require('fs-extra');
const JSONFileItem = require('./JSONFileItem');

/**
 * @typedef {import('../Framework')} Framework
 * @typedef {import('./JSONFile')} JSONFile
 */

/**
 * An abstraction for centralising the loading of JSON files, keeping track of
 * sub-item changes and saving changed files.
 */
class JSONFile {

  /**
   * @param {Object} options
   * @param {Framework} options.framework
   * @param {string} options.path
   * @param {Object|Array} options.data
   * @param {boolean} options.hasChanged
   */
  constructor({
    framework = null,
    path = null,
    data = null,
    hasChanged = false
  } = {}) {
    /** @type {Framework} */
    this.framework = framework;
    /** @type {string} */
    this.path = path;
    /** @type {Object|Array} */
    this.data = data;
    /** @type {boolean} */
    this.hasChanged = hasChanged;
    /** @type {[JSONFileItem]} */
    this.fileItems = null;
  }

  /** @returns {JSONFile} */
  load() {
    this.fileItems = [];

    if (this.path) {
      this.data = fs.readJSONSync(this.path);
    }

    const addObject = (item, index = null) => {
      this.fileItems.push(new JSONFileItem({
        framework: this.framework,
        file: this,
        item,
        index
      }));
    };

    if (this.data instanceof Array) {
      this.data.forEach((item, index) => addObject(item, index));
    } else if (this.data instanceof Object) {
      addObject(this.data, null);
    } else {
      const err = new Error(`Cannot load json file ${this.path} as it doesn't contain an Array or Object as its root`);
      err.number = 10013;
      throw err;
    }

    return this;
  }

  /**
   * This is useful for files such as config.json or course.json which only have
   * one item/object per file.
   * @returns {JSONFileItem}
   */
  get firstFileItem() {
    return this.fileItems && this.fileItems[0];
  }

  /**
   * Marks this file as having changed. This should be called after changing
   * the fileItems contained in this instance.
   * @returns {JSONFile}
   */
  changed() {
    this.hasChanged = true;
    return this;
  }

  /**
   * Saves any fileItem changes to disk.
   * @return {JSONFile}
   */
  save() {
    if (!this.hasChanged) {
      return this;
    }
    fs.writeJSONSync(this.path, this.data, { spaces: 2 });
    return this;
  }

}

module.exports = JSONFile;
