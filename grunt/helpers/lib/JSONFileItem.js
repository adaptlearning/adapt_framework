/**
 * @typedef {import('../Framework')} Framework
 * @typedef {import('./JSONFile')} JSONFile
 */

/**
 * An abstraction for carrying JSON sub-items with their file origins and locations.
 */
class JSONFileItem {

  constructor({
    framework = null,
    file = null,
    item = null,
    index = null
  } = {}) {
    /** @type {Framework} */
    this.framework = framework;
    /** @type {JSONFile} */
    this.file = file;
    /** @type {Object} */
    this.item = item;
    /** @type {number} */
    this.index = index;
  }

}

module.exports = JSONFileItem;
