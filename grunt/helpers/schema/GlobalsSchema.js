const Schema = require('./Schema');

/**
 * @typedef {import('./Framework')} Framework
 * @typedef {import('../plugins/Plugin')} Plugin
 */

/**
 * Represents the globals properties listed in a model or extension schema.
 * @todo _globals doesn't need to differentiate by plugin type, plugin name should suffice
 * @todo We should drop all pluralisations, they're unnecessary and complicated.
 */
class GlobalsSchema extends Schema {

  /**
   * @param {Object} options
   * @param {Framework} options.framework
   * @param {string} options.name
   * @param {Plugin} options.plugin
   * @param {Object} options.json
   * @param {string} options.filePath
   * @param {string} options.globalsType
   * @param {string} options.targetAttribute Attribute where this sub-schema will be injected into the course.json:_globals._[pluginType] object
   */
  constructor({
    framework = null,
    name = '',
    plugin = null,
    json = {},
    filePath = '',
    globalsType = '',
    targetAttribute = ''
  } = {}) {
    super({ framework, name, plugin, json, filePath, globalsType });
    // Add an underscore to the front of the targetAttribute if necessary
    this.targetAttribute = (targetAttribute && targetAttribute[0] !== '_' ? '_' : '') + targetAttribute;
  }

  /**
   * Returns the sub-schema for the course.json:_globals object.
   * @returns {Object|undefined}
   */
  getCourseGlobalsPart() {
    if (!this.json.globals) {
      return;
    }
    /**
     * pluralise location name if necessary (components, extensions) etc
     */
    const shouldPluralise = ['component', 'extension'].includes(this.globalsType);
    const globalsType = shouldPluralise ? this.globalsType + 's' : this.globalsType;
    return {
      [`_${globalsType}`]: {
        type: 'object',
        properties: {
          [this.targetAttribute]: {
            type: 'object',
            properties: this.json.globals
          }
        }
      }
    };
  }

}

module.exports = GlobalsSchema;
