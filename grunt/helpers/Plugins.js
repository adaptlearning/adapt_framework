const globs = require('globs');
const Plugin = require('./plugins/Plugin');

/**
 * @typedef {import('./Framework')} Framework
 * @typedef {import('./lib/JSONFileItem')} JSONFileItem
 */

/**
 * Represents all of the plugins in the src/ folder.
 */
class Plugins {

  /**
   * @param {Object} options
   * @param {Framework} options.framework
   * @param {function} options.includedFilter
   * @param {string} options.sourcePath
   * @param {function} options.log
   * @param {function} options.warn
   */
  constructor({
    framework = null,
    includedFilter = function() { return true; },
    sourcePath = process.cwd() + '/src/',
    courseDir = 'course',
    log = console.log,
    warn = console.warn
  } = {}) {
    /** @type {Framework} */
    this.framework = framework;
    /** @type {function} */
    this.includedFilter = includedFilter;
    /** @type {string} */
    this.sourcePath = sourcePath;
    /** @type {string} */
    this.courseDir = courseDir;
    /** @type {function} */
    this.log = log;
    /** @type {function} */
    this.warn = warn;
    /** @type {[Plugin]} */
    this.plugins = [];
  }

  /**
   * Returns the locations of all plugins in the src/ folder.
   * @returns {[string]}
   */
  get pluginLocations() {
    return [
      `${this.sourcePath}core/`,
      `${this.sourcePath}!(core|${this.courseDir})/*/`
    ];
  }

  /** @returns {Plugins} */
  load() {
    this.plugins = globs.sync(this.pluginLocations).map(sourcePath => {
      if (!this.includedFilter(sourcePath)) {
        return;
      }
      const plugin = new Plugin({
        framework: this.framework,
        sourcePath,
        log: this.log,
        warn: this.warn
      });
      plugin.load();
      return plugin;
    }).filter(Boolean);
    return this;
  }

  /** @returns {JSONFileItem} */
  getAllPackageJSONFileItems() {
    return this.plugins.reduce((items, plugin) => {
      items.push(...plugin.packageJSONFile.fileItems);
      return items;
    }, []);
  }

}

module.exports = Plugins;
