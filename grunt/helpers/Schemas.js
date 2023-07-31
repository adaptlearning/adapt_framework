const _ = require('lodash');
const path = require('path');
const fs = require('fs-extra');
const globs = require('globs');
const ExtensionSchema = require('./schema/ExtensionSchema');
const ModelSchema = require('./schema/ModelSchema');
const ModelSchemas = require('./schema/ModelSchemas');
const Plugins = require('./Plugins');

/**
 * @typedef {import('./Framework')} Framework
 * @typedef {import('./Plugins')} Plugins
 * @typedef {import('./plugins/Plugin')} Plugin
 */

/**
 * Represents all of the schemas in a course.
 * @todo Work out how to do schema inheritance properly (i.e. component+accordion)
 * @todo Stop deriving schema types (model/extension) from bower and/or folder paths
 * @todo Stop deriving schema names from bower.json or filenames
 * @todo Combining and applying multiple schemas for validation or defaults needs consideration
 */
class Schemas {

  /**
   * @param {Object} options
   * @param {Framework} options.framework
   * @param {function} options.includedFilter
   * @param {Plugins} options.plugins
   * @param {string} options.sourcePath
   * @param {function} options.log
   * @param {function} options.warn
   */
  constructor({
    framework = null,
    includedFilter = function() { return true; },
    plugins = null,
    sourcePath = '',
    log = console.log,
    warn = console.warn
  } = {}) {
    /** @type {Framework} */
    this.framework = framework;
    /** @type {function} */
    this.includedFilter = includedFilter;
    /** @type {string} */
    this.sourcePath = sourcePath.replace(/\\/g, '/');
    /** @type {Plugins} */
    this.plugins = plugins;
    /** @type {[Schema]]} */
    this.schemas = null;
    /** @type {function} */
    this.log = log;
    /** @type {function} */
    this.warn = warn;
  }

  /** @returns {Schemas} */
  load() {

    /**
     * @param {Plugin} plugin
     * @param {string} filePath
     */
    const createSchema = (plugin, filePath) => {
      const json = fs.readJSONSync(filePath);
      const isExtensionSchema = Boolean(json.properties.pluginLocations);
      const InferredSchemaClass = (isExtensionSchema ? ExtensionSchema : ModelSchema);
      const inferredSchemaName = (plugin.name === 'core') ?
        path.parse(filePath).name.split('.')[0] : // if core, get schema name from file name
        isExtensionSchema ?
          plugin.name : // assume schema name is plugin name
          plugin.targetAttribute; // assume schema name is plugin._[type] value
      return new InferredSchemaClass({
        name: inferredSchemaName,
        plugin,
        framework: this.framework,
        filePath,
        globalsType: plugin.type,
        targetAttribute: plugin.targetAttribute
      });
    };

    this.plugins = new Plugins({
      framework: this.framework,
      includedFilter: this.includedFilter,
      sourcePath: this.sourcePath,
      log: this.log,
      warn: this.warn
    });
    this.plugins.load();

    this.schemas = [];
    this.plugins.plugins.forEach(plugin => globs.sync(plugin.schemaLocations).forEach(filePath => {
      const schema = createSchema(plugin, filePath);
      schema.load();
      this.schemas.push(schema);
    }));

    this.generateCourseGlobals();
    this.generateModelExtensions();

    return this;
  }

  /**
   * Copy globals schema extensions from model/extension plugins to the course._globals
   * schema.
   * @returns {Schemas}
   * @example
   * courseModelSchema.properties._globals.properties._components.properties._accordion
   */
  generateCourseGlobals() {
    const courseSchema = this.getCourseSchema();
    this.schemas.forEach(schema => {
      const globalsPart = schema.getCourseGlobalsPart();
      if (!globalsPart) {
        return;
      }
      _.merge(courseSchema.json.properties._globals.properties, globalsPart);
    });
    return this;
  }

  /**
   * Copy pluginLocations schema extensions from the extension plugins to the appropriate model schemas
   * @returns {Schemas}
   * @example
   * courseModelSchema.properties._assessment
   * articleModelSchema.properties._trickle
   * blockModelSchema.properties._trickle
   */
  generateModelExtensions() {
    const extensionSchemas = this.schemas.filter(schema => schema instanceof ExtensionSchema);
    extensionSchemas.forEach(schema => {
      const extensionParts = schema.getModelExtensionParts();
      if (!extensionParts) {
        return;
      }
      for (const modelName in extensionParts) {
        const extensionPart = extensionParts[modelName];
        /**
         * Check if the sub-schema part has any defined properties.
         * A lot of extension schemas have empty objects with no properties.
         */
        if (!extensionPart.properties) {
          continue;
        }
        const modelSchema = this.getModelSchemaByName(modelName);
        if (!modelSchema) {
          const err = new Error(`Cannot add extensions to model which doesn't exits ${modelName}`);
          err.number = 10012;
          throw err;
        }
        /**
         * Notice that the targetAttribute is not used here, we allow the extension schema
         * to define its own _[targetAttribute] to extend any core model.
         */
        modelSchema.json.properties = _.merge({}, modelSchema.json.properties, extensionPart.properties);
      }
    });
    return this;
  }

  /**
   * @param {string} schemaName
   * @returns {ModelSchema}
   */
  getModelSchemaByName(schemaName) {
    const modelSchemas = this.schemas.filter(schema => schema instanceof ModelSchema);
    return modelSchemas.find(({ name }) => name === schemaName);
  }

  /** @returns {ModelSchema} */
  getCourseSchema() {
    return this.getModelSchemaByName('course');
  }

  /** @returns {ModelSchema} */
  getConfigSchema() {
    return this.getModelSchemaByName('config');
  }

  /**
   * Uses a model JSON to derive the appropriate schemas for the model.
   * @param {Object} json
   * @returns {ModelSchemas}
   */
  getSchemasForModelJSON(json) {
    const schemas = [];
    if (json._type) {
      if (json._type === 'menu' || json._type === 'page') {
        schemas.push(this.getModelSchemaByName('contentobject'));
      }
      schemas.push(this.getModelSchemaByName(json._type));
    }
    if (json._component) {
      schemas.push(this.getModelSchemaByName(json._component));
    }
    if (json._model) {
      schemas.push(this.getModelSchemaByName(json._model));
    }
    return new ModelSchemas({
      framework: this.framework,
      schemas: schemas.filter(Boolean)
    });
  }

}

module.exports = Schemas;
