const path = require('path');
const fs = require('fs-extra');
const globs = require('globs');
const JSONFile = require('./lib/JSONFile');
const Language = require('./data/Language');

/**
 * @typedef {import('./Framework')} Framework
 * @typedef {import('./lib/JSONFileItem')} JSONFileItem
 */

/**
 * This class represents the course folder. It contains references to the config.json,
 * all languages, each language file and subsequently each language file item.
 * It is filename agnostic, except for config.[jsonext], such that there are no
 * hard references to the other file names, allowing any filename to be used with the
 * appropriate [jsonext] file extension (usually txt or json).
 * It assumes all language files are located at course/[langName]/*.[jsonext] and
 * the config file is located at course/config.[jsonext].
 * It has _id and _parentId structure checking and _trackingId management included.
 */
class Data {

  /**
   * @param {Object} options
   * @param {Framework} options.framework
   * @param {string} options.sourcePath
   * @param {string} options.courseDir
   * @param {string} options.jsonext
   * @param {string} options.trackingIdType
   * @param {function} options.log
   */
  constructor({
    framework = null,
    sourcePath = null,
    courseDir = null,
    jsonext = 'json',
    trackingIdType = 'block',
    log = console.log
  } = {}) {
    /** @type {Framework} */
    this.framework = framework;
    /** @type {string} */
    this.sourcePath = sourcePath;
    /** @type {string} */
    this.courseDir = courseDir;
    /** @type {string} */
    this.jsonext = jsonext;
    /** @type {string} */
    this.trackingIdType = trackingIdType;
    /** @type {function} */
    this.log = log;
    /** @type {JSONFile} */
    this.configFile = null;
    /** @type {[Language]} */
    this.languages = null;
  }

  /** @returns {Data} */
  load() {
    const coursePath = path.join(this.sourcePath, this.courseDir).replace(/\\/g, '/');
    this.languages = globs.sync(path.join(coursePath, '*/')).map(languagePath => {
      const language = new Language({
        framework: this.framework,
        languagePath,
        courseDir: this.courseDir,
        jsonext: this.jsonext,
        trackingIdType: this.trackingIdType,
        log: this.log
      });
      language.load();
      return language;
    }).filter(lang => lang.isValid);
    this.configFile = new JSONFile({
      framework: this.framework,
      path: path.join(coursePath, `config.${this.jsonext}`)
    });
    this.configFile.load();
    return this;
  }

  /** @type {boolean} */
  get hasChanged() {
    return this.languages.some(language => language.hasChanged);
  }

  /** @type {[string]} */
  get languageNames() {
    return this.languages.map(language => language.name);
  }

  /**
   * Fetch a Language instance by name.
   * @param {string} name
   * @returns {Language}
   */
  getLanguage(name) {
    const language = this.languages.find(language => language.name === name);
    if (!language) {
      const err = new Error(`Cannot find language '${name}'.`);
      err.number = 10004;
      throw err;
    }
    return language;
  }

  /**
   * Returns a JSONFileItem representing the course/config.json file object.
   * @returns {JSONFileItem}
   * */
  getConfigFileItem() {
    return this.configFile.firstFileItem;
  }

  /**
   * @param {string} fromName
   * @param {string} toName
   * @param {boolean} replace
   * @returns {Language}
   */
  copyLanguage(fromName, toName, replace = false) {
    const fromLang = this.getLanguage(fromName);
    const newPath = (`${fromLang.rootPath}/${toName}/`).replace(/\\/g, '/');

    if (this.languageNames.includes(toName) && !replace) {
      const err = new Error(`Folder already exists. ${newPath}`);
      err.number = 10003;
      throw err;
    }

    let toLang;
    if (this.languageNames.includes(toName)) {
      toLang = this.getLanguage(toName);
    } else {
      toLang = new Language({
        framework: this.framework,
        languagePath: newPath,
        courseDir: this.courseDir,
        jsonext: this.jsonext,
        trackingIdType: this.trackingIdType
      });
      this.languages.push(toLang);
    }

    fs.mkdirpSync(newPath);

    fromLang.files.forEach(file => {
      const pathParsed = path.parse(file.path.replace(/\\/g, '/'));
      const newLocation = `${newPath}${pathParsed.name}${pathParsed.ext}`;
      fs.removeSync(newLocation);
      fs.copyFileSync(file.path, newLocation);
    });

    toLang.load();
    return toLang;
  }

  /** @returns {Data} */
  checkIds() {
    this.languages.forEach(lang => lang.checkIds());
    return this;
  }

  /** @returns {Data} */
  addTrackingIds() {
    this.languages.forEach(lang => lang.addTrackingIds());
    return this;
  }

  /** @returns {Data} */
  removeTrackingIds() {
    this.languages.forEach(lang => lang.removeTrackingIds());
    return this;
  }

  /** @returns {Data} */
  save() {
    this.configFile.save();
    this.languages.forEach(language => language.save());
    return this;
  }

}

module.exports = Data;
