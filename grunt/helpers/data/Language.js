const path = require('path');
const fs = require('fs-extra');
const globs = require('globs');
const _ = require('lodash');
const chalk = require('chalk');
const LanguageFile = require('./LanguageFile');

/**
 * @typedef {import('../Framework')} Framework
 * @typedef {import('../lib/JSONFileItem')} JSONFileItem
 */

/**
 * Represents all of the json files and file item in a language directory
 * at course/[lang]/*.[jsonext].
 * It is filename agnostic, such that there are no hard references to file names.
 * It has _id and _parentId structure checking and _trackingId management included.
 */
class Language {

  /**
   * @param {Object} options
   * @param {Framework} options.framework
   * @param {string} options.languagePath
   * @param {string} options.jsonext
   * @param {string} options.trackingIdType,
   * @param {function} options.log
   */
  constructor({
    framework = null,
    languagePath = '',
    jsonext = 'json',
    trackingIdType = 'block',
    log = console.log
  } = {}) {
    /** @type {Framework} */
    this.framework = framework;
    /** @type {string} */
    this.jsonext = jsonext;
    /** @type {string} */
    this.path = path.normalize(languagePath).replace(/\\/g, '/');
    /** @type {string} */
    this.name = this.path.split('/').filter(Boolean).pop();
    /** @type {string} */
    this.rootPath = this.path.split('/').filter(Boolean).slice(0, -1).join('/');
    /** @type {string} */
    this.manifestFileName = 'language_data_manifest.js';
    /** @type {string} */
    this.manifestPath = this.path + this.manifestFileName;
    /** @type {string} */
    this.trackingIdType = trackingIdType;
    /** @type {[LanguageFile]} */
    this.files = null;
    /** @type {Object.<string, JSONFileItem>} */
    this._itemIdIndex = null;
    /** @type {[JSONFileItem]} */
    this.courseFileItem = null;
    /** @type {function} */
    this.log = log;
  }

  /** @returns {Language} */
  load() {
    this.files = [];
    this._itemIdIndex = {};
    this.courseFileItem = null;

    const dataFiles = globs.sync(path.join(this.path, '*.' + this.jsonext)).map((dataFilePath) => {
      const relativePath = dataFilePath.slice(this.path.length);
      return relativePath;
    }).filter((dataFilePath) => {
      const isManifest = (dataFilePath === this.manifestPath);
      // Skip file if it is the Authoring Tool import/export asset manifest
      const isAATAssetJSON = (dataFilePath === 'assets.json');
      return !isManifest && !isAATAssetJSON;
    });

    dataFiles.forEach(jsonFileName => {
      const jsonFilePath = (this.path + jsonFileName).replace(/\\/g, '/');
      const file = new LanguageFile({
        framework: this.framework,
        language: this,
        path: jsonFilePath,
        data: null,
        hasChanged: false
      });
      file.load();
      this.files.push(file);
    });

    this._itemIdIndex = this.getAllFileItems().reduce((index, fileItem) => {
      const { file, item } = fileItem;
      if (item._id && index[item._id]) {
        const err = new Error(`Duplicate ids ${item._id} in ${index[item._id].file.path} and ${file.path}`);
        err.number = 10006;
        throw err;
      } else if (item._id) {
        index[item._id] = fileItem;
      }
      if (item._type === 'course' && this.courseFileItem) {
        const err = new Error(`Duplicate course items found, in ${index[item._id].file.path} and ${file.path}`);
        err.number = 10007;
        throw err;
      } else if (item._type === 'course') {
        this.courseFileItem = fileItem;
      }
      return index;
    }, {});

    return this;
  }

  /** @type {boolean} */
  get isValid() {
    return Boolean(this.courseFileItem);
  }

  /** @type {boolean} */
  get hasChanged() {
    return this.files.some(file => file.hasChanged);
  }

  /**
   * Produces a manifest file for the Framework data layer at course/lang/language_data_manifest.js.
   * @returns {Language}
   */
  saveManifest() {
    const dataFiles = globs.sync(path.join(this.path, '*.' + this.jsonext)).map((dataFilePath) => {
      const relativePath = dataFilePath.slice(this.path.length);
      return relativePath;
    }).filter((dataFilePath) => {
      const isManifest = (dataFilePath === this.manifestPath);
      // Skip file if it is the Authoring Tool import/export asset manifest
      const isAATAssetJSON = (dataFilePath === 'assets.json');
      return !isManifest && !isAATAssetJSON;
    });
    const hasNoDataFiles = !dataFiles.length;
    if (hasNoDataFiles) {
      const err = new Error(`No data files found in ${this.path}`);
      err.number = 10008;
      throw err;
    }
    fs.writeJSONSync(this.manifestPath, dataFiles, { spaces: 0 });
    return this;
  }

  /** @returns {[JSONFileItem]} */
  getAllFileItems() {
    return this.files.reduce((memo, file) => {
      memo.push(...file.fileItems);
      return memo;
    }, []);
  }

  /** @returns {JSONFileItem} */
  getCourseFileItem() {
    if (!this.courseFileItem) {
      const err = new Error(`Could not find course item for ${this.path}`);
      err.number = 10009;
      throw err;
    }
    return this.courseFileItem;
  }

  /**
   * @param {string} id
   * @returns {JSONFileItem}
   */
  getFileItemById(id) {
    const fileItem = this._itemIdIndex[id];
    if (!fileItem) {
      const err = new Error(`Could not find item for id ${id} in ${this.path}`);
      err.number = 10010;
      throw err;
    }
    return fileItem;
  }

  /** @returns {Language} */
  checkIds() {
    const items = this.getAllFileItems().map(({ item }) => item);
    // Index and group
    const idIndex = _.keyBy(items, '_id');
    const idGroups = _.groupBy(items, '_id');
    const parentIdGroups = _.groupBy(items, '_parentId');
    // Setup error collection arrays
    let orphanedIds = {};
    let emptyIds = {};
    let duplicateIds = {};
    let missingIds = {};
    items.forEach((o) => {
      const isCourseType = (o._type === 'course');
      const isComponentType = (o._type === 'component');
      if (idGroups[o._id].length > 1) {
        duplicateIds[o._id] = true; // Id has more than one item
      }
      if (!isComponentType && !parentIdGroups[o._id]) {
        emptyIds[o._id] = true; // Course has no children
      }
      if (!isCourseType && (!o._parentId || !idIndex[o._parentId])) {
        orphanedIds[o._id] = true; // Item has no defined parent id or the parent id doesn't exist
      }
      if (!isCourseType && o._parentId && !idIndex[o._parentId]) {
        missingIds[o._parentId] = true; // Referenced parent item does not exist
      }
    });
    orphanedIds = Object.keys(orphanedIds);
    emptyIds = Object.keys(emptyIds);
    duplicateIds = Object.keys(duplicateIds);
    missingIds = Object.keys(missingIds);
    // Output for each type of error
    const hasErrored = orphanedIds.length || emptyIds.length || duplicateIds.length || missingIds.length;
    if (orphanedIds.length) {
      this.log(chalk.yellow(`Orphaned _ids: ${orphanedIds}`));
    }
    if (missingIds.length) {
      this.log(chalk.yellow(`Missing _ids: ${missingIds}`));
    }
    if (emptyIds.length) {
      this.log(chalk.yellow(`Empty _ids: ${emptyIds}`));
    }
    if (duplicateIds.length) {
      this.log(chalk.yellow(`Duplicate _ids: ${duplicateIds}`));
    }
    // If any error has occured, stop processing.
    if (hasErrored) {
      const err = new Error('Oops, looks like you have some json errors.');
      err.number = 10011;
      throw err;
    }
    this.log(`No issues found in course/${this.name}, your JSON is a-ok!`);

    return this;
  }

  /** @returns {Language} */
  addTrackingIds() {
    const { file, item: course } = this.getCourseFileItem();
    course._latestTrackingId = course._latestTrackingId || -1;
    file.changed();

    let wasAdded = false;
    const trackingIdsSeen = [];
    const fileItems = this.getAllFileItems().filter(fileItem => fileItem.item._type === this.trackingIdType);
    fileItems.forEach(({ file, item }) => {
      this.log(`${this.trackingIdType}: ${item._id}: ${item._trackingId !== undefined ? item._trackingId : 'not set'}`);
      if (item._trackingId === undefined) {
        item._trackingId = ++course._latestTrackingId;
        file.changed();
        wasAdded = true;
        this.log(`Adding tracking ID: ${item._trackingId} to ${this.trackingIdType} ${item._id}`);
      } else {
        if (trackingIdsSeen.indexOf(item._trackingId) > -1) {
          item._trackingId = ++course._latestTrackingId;
          file.changed();
          wasAdded = true;
          this.log(`Warning: ${item._id} has the tracking ID ${item._trackingId} but this is already in use. Changing to ${course._latestTrackingId + 1}.`);
        } else {
          trackingIdsSeen.push(item._trackingId);
        }
      }
      if (course._latestTrackingId < item._trackingId) {
        course._latestTrackingId = item._trackingId;
      }
    });

    this.save();
    this.log(`Tracking IDs ${wasAdded ? 'were added to' : 'are ok for'} course/${this.name}. The latest tracking ID is ${course._latestTrackingId}\n`);

    return this;
  }

  /** @returns {Language} */
  removeTrackingIds() {
    const { file, item: course } = this.getCourseFileItem();
    course._latestTrackingId = -1;
    file.changed();

    this.getAllFileItems().forEach(({ file, item }) => {
      if (item._type !== this.trackingIdType) return;
      delete item._trackingId;
      file.changed();
    });

    this.save();
    this.log(`Tracking IDs removed from course/${this.name}.`);

    return this;
  }

  /** @returns {Language} */
  save() {
    this.files.forEach(file => file.save());
    this.load();
    return this;
  }

}

module.exports = Language;
