const path = require('path');
const JSONFile = require('./lib/JSONFile');
const Data = require('./Data');
const Translate = require('./Translate');
const Plugins = require('./Plugins');
const Schemas = require('./Schemas');

/**
 * @typedef {import('./lib/JSONFileItem')} JSONFileItem
 */

/**
 * The class represents an Adapt Framework root directory. It provides APIs for
 * plugins, schemas, data and translations.
 */
class Framework {

  /**
   * @param {Object} options
   * @param {string} options.rootPath
   * @param {string} options.outputPath
   * @param {string} options.sourcePath
   * @param {function} options.includedFilter
   * @param {string} options.jsonext
   * @param {string} options.trackingIdType,
   * @param {boolean} options.useOutputData
   * @param {function} options.log
   * @param {function} options.warn
   */
  constructor({
    rootPath = process.cwd(),
    outputPath = process.cwd() + '/build/',
    sourcePath = process.cwd() + '/src/',
    courseDir = 'course',
    includedFilter = function() { return true; },
    jsonext = 'json',
    trackingIdType = 'block',
    useOutputData = false,
    log = console.log,
    warn = console.warn
  } = {}) {
    /** @type {string} */
    this.rootPath = rootPath.replace(/\\/g, '/');
    /** @type {string} */
    this.outputPath = outputPath.replace(/\\/g, '/');
    /** @type {string} */
    this.sourcePath = sourcePath.replace(/\\/g, '/');
    /** @type {string} */
    this.courseDir = courseDir;
    /** @type {function} */
    this.includedFilter = includedFilter;
    /** @type {string} */
    this.jsonext = jsonext;
    /** @type {string} */
    this.trackingIdType = trackingIdType;
    /** @type {boolean} */
    this.useOutputData = useOutputData;
    /** @type {function} */
    this.log = log;
    /** @type {function} */
    this.warn = warn;
    /** @type {JSONFile} */
    this.packageJSONFile = null;
  }

  /** @returns {Framework} */
  load() {
    this.packageJSONFile = new JSONFile({
      framework: this,
      path: path.join(this.rootPath, 'package.json').replace(/\\/g, '/')
    });
    this.packageJSONFile.load();
    return this;
  }

  /** @returns {JSONFileItem} */
  getPackageJSONFileItem() {
    return this.packageJSONFile.firstFileItem;
  }

  /** @returns {string} */
  get version() {
    return this.getPackageJSONFileItem().item.version;
  }

  /**
   * Returns a Data instance for either the src/course or build/course folder
   * depending on the specification of the useOutputData property on either the
   * function or the Framework instance.
   * @returns {Data}
   */
  getData({
    useOutputData = this.useOutputData
  } = {}) {
    const data = new Data({
      framework: this,
      sourcePath: useOutputData ? this.outputPath : this.sourcePath,
      courseDir: this.courseDir,
      jsonext: this.jsonext,
      trackingIdType: this.trackingIdType,
      log: this.log
    });
    data.load();
    return data;
  }

  /** @returns {Plugins} */
  getPlugins({
    includedFilter = this.includedFilter
  } = {}) {
    const plugins = new Plugins({
      framework: this.framework,
      includedFilter,
      sourcePath: this.sourcePath,
      log: this.log,
      warn: this.warn
    });
    plugins.load();
    return plugins;
  }

  /** @returns {Schemas} */
  getSchemas({
    includedFilter = this.includedFilter
  } = {}) {
    const schemas = new Schemas({
      framework: this,
      includedFilter,
      sourcePath: this.sourcePath,
      log: this.log
    });
    schemas.load();
    return schemas;
  }

  /** @returns {Translate} */
  getTranslate({
    includedFilter = this.includedFilter,
    masterLang = 'en',
    targetLang = null,
    format = 'csv',
    csvDelimiter = ',',
    shouldReplaceExisting = false,
    languagePath = '',
    isTest = false
  } = {}) {
    const translate = new Translate({
      framework: this,
      includedFilter,
      masterLang,
      targetLang,
      format,
      csvDelimiter,
      shouldReplaceExisting,
      jsonext: this.jsonext,
      sourcePath: this.sourcePath,
      languagePath,
      outputPath: this.outputPath,
      courseDir: this.courseDir,
      useOutputData: this.useOutputData,
      isTest,
      log: this.log,
      warn: this.warn
    });
    translate.load();
    return translate;
  }

  /** @returns {Framework} */
  applyGlobalsDefaults({
    includedFilter = this.includedFilter,
    useOutputData = this.useOutputData
  } = {}) {
    const schemas = this.getSchemas({
      includedFilter
    });
    const courseSchema = schemas.getCourseSchema();
    const data = this.getData(useOutputData);
    data.languages.forEach(language => {
      const { file, item: course } = language.getCourseFileItem();
      course._globals = courseSchema.applyDefaults(course._globals, '_globals');
      file.changed();
    });
    data.save();
    return this;
  }

}

module.exports = Framework;
