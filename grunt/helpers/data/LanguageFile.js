const JSONFile = require('../lib/JSONFile');

/**
 * @typedef {import('../Framework')} Framework
 * @typedef {import('./Language')} Language
 */

/**
 * Represents any of the files at course/[lang]/*.[jsonext].
 */
class LanguageFile extends JSONFile {

  /**
   * @param {Object} options
   * @param {Framework} options.framework
   * @param {Language} options.language
   * @param {string} options.path
   * @param {Object} options.data
   * @param {boolean} options.hasChanged
   */
  constructor({
    framework = null,
    language = null,
    path = null,
    data = null,
    hasChanged = false
  } = {}) {
    super({ framework, path, data, hasChanged });
    /** @type {Language} */
    this.language = language;
  }

}

module.exports = LanguageFile;
