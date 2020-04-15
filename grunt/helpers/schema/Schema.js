const _ = require('lodash');
const fs = require('fs-extra');

/**
 * @typedef {import('./Framework')} Framework
 * @typedef {import('./JSONFileItem')} JSONFileItem
 * @typedef {import('../plugins/Plugin')} Plugin
 */

class Schema {

  /**
   * @param {Object} options
   * @param {Framework} options.framework
   * @param {string} options.name
   * @param {Plugin} options.plugin
   * @param {Object} options.json
   * @param {string} options.filePath
   * @param {string} options.globalsType
   */
  constructor({
    framework = null,
    name = '',
    plugin = null,
    json = null,
    filePath = '',
    globalsType = ''
  } = {}) {
    /** @type {Framework} */
    this.framework = framework;
    /** @type {Plugin} */
    this.plugin = plugin;
    /** @type {string} */
    this.name = name;
    /** @type {Object} */
    this.json = json;
    /** @type {string} */
    this.filePath = filePath;
    /** @type {string} */
    this.globalsType = globalsType;
  }

  /** @returns {Schema} */
  load() {
    this.json = fs.readJSONSync(this.filePath);
    return this;
  }

  /**
   * Walk through schema properties and an object's attributes calling an
   * iterator function with the attributeName, attributeType and schema
   * description along with the framework object, the current object attribute
   * node and any other pass-through arguments.
   * @param {string} schemaPath The attribute path from which to start in the schema
   * @param {SchemaTraverseIterator} iterator
   * @param  {...any} args pass-through arguments
   * @returns {Schema}
   */
  traverse(schemaPath, iterator, ...args) {
    let shouldStop = false;
    const json = schemaPath ? _.get(this.json.properties, schemaPath) : this.json;
    const recursiveSchemaNodeProperties = (properties, ...args) => {
      let rtnValue = false;
      // process properties
      for (let attributeName in properties) {
        let description = properties[attributeName];
        if (description.hasOwnProperty('editorOnly') || !description.hasOwnProperty('type')) {
          // go to next attribute
          continue;
        }
        description = { framework: this.framework, name: attributeName, ...description };
        // process current properties attribute
        const returned = iterator({
          description,
          next: (...args) => {
            // continue with recursion if able
            switch (description.type) {
              case 'object':
                return recursiveSchemaNodeProperties(description.properties, ...args);
              case 'array':
                if (description.items.type === 'object') {
                  return recursiveSchemaNodeProperties(description.items.properties, ...args);
                }
                const next = {};
                next[attributeName] = description.items;
                return recursiveSchemaNodeProperties(next, ...args);
            }
          },
          stop: () => {
            shouldStop = true;
          }
        }, ...args);
        rtnValue = rtnValue || returned;
        if (shouldStop) {
          return;
        }
      }
    };
    recursiveSchemaNodeProperties(json.properties, ...args);
    return this;
  }

  /**
   * Applies schema defaults to the given object.
   * @param {Object} output
   * @param {string} schemaPath
   * @param {Object} options
   * @param {boolean} options.fillObjects Infer array or object default objects
   * @returns {Schema}
   */
  applyDefaults(output = {}, schemaPath, options = { fillObjects: true }) {

    function sortKeys(object) {
      const keys = Object.keys(object).sort((a, b) => {
        return a.localeCompare(b);
      });
      keys.forEach(name => {
        const value = object[name];
        delete object[name];
        object[name] = value;
      });
      return object;
    }

    this.traverse(schemaPath, ({ description, next }, output) => {
      let hasChanged = false;
      let haveChildenChanged = false;
      let defaultValue;
      switch (description.type) {
        case 'object':
          defaultValue = description.hasOwnProperty('default') && options.fillObjects ? description.default : {};
          if (!output.hasOwnProperty(description.name)) {
            output[description.name] = defaultValue;
            hasChanged = true;
          }
          haveChildenChanged = next(output[description.name]);
          if (haveChildenChanged) {
            sortKeys(output[description.name]);
          }
          break;
        case 'array':
          defaultValue = description.hasOwnProperty('default') && options.fillObjects ? description.default : [];
          if (!output.hasOwnProperty(description.name)) {
            output[description.name] = defaultValue;
            hasChanged = true;
          }
          haveChildenChanged = next(output[description.name]);
          if (haveChildenChanged) {
            sortKeys(output[description.name]);
          }
          break;
        default:
          defaultValue = description.default;
          if (description.hasOwnProperty('default') && !output.hasOwnProperty(description.name)) {
            output[description.name] = defaultValue;
            hasChanged = true;
          }
          break;
      }
      return hasChanged;
    }, output);

    return output;
  }

}

/**
 * @typedef SchemaNodeDescription
 * @property {Framework} framework Schema properties node
 * @property {string} name Attribute name
 * @property {string} type Attribute type
 * @property {boolean} editorOnly
 */

/**
 * @typedef SchemaTraverseIteratorParam0
 * @property {SchemaNodeDescription} description
 * @property {function} next
 * @property {function} stop
 */

/**
 * Iterator function for schema.traverse.
 * @callback SchemaTraverseIterator
 * @param {SchemaTraverseIteratorParam0} config
 * @param  {...any} args pass-through arguments
 */

module.exports = Schema;
