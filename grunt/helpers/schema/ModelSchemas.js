const _ = require('lodash');

/**
 * @typedef {import('./Framework')} Framework
 * @typedef {import('./ModelSchema')} ModelSchema
 * @typedef {import('./Schema')} Schema
 */

/**
 * Encapsulates a collection of ModelSchema
 * @todo Validation, maybe, if this set of files is used in the AAT
 */
class ModelSchemas {

  /**
   * @param {Object} options
   * @param {Framework} options.framework
   * @param {[ModelSchema]} options.schemas
   */
  constructor({
    framework = null,
    schemas = []
  } = {}) {
    /** @type {Framework} */
    this.framework = framework;
    /** @type {[ModelSchema]} */
    this.schemas = schemas;
  }

  /**
   * Returns an array of translatable attribute paths derived from the schemas.
   * @returns {[string]}
   */
  getTranslatablePaths() {
    return _.uniq(this.schemas.reduce((paths, modelSchema) => {
      paths.push(...modelSchema.getTranslatablePaths());
      return paths;
    }, []));
  }

}

module.exports = ModelSchemas;
