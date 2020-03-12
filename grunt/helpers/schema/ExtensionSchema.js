const GlobalsSchema = require('./GlobalsSchema');

/**
 * Represents a model extension schema. Currently these schemas are only able to
 * extend config, course, contentobject, article, block and component models.
 *
 * @todo pluginLocations is not a good way of listing model extensions or detecting
 * extension schemas. There should be a schema type (model/extension) and
 * the extensions should be declared at the root of the schema.
 * @todo pluginLocations[modelName] should extend any model (article, block,
 * accordion, narrative)
 */
class ExtensionSchema extends GlobalsSchema {

  /**
   * Returns the defined model extension sub-schemas listed at pluginLocations.
   * @returns {Object|undefined}
   */
  getModelExtensionParts() {
    if (!this.json.properties.pluginLocations || !this.json.properties.pluginLocations.properties) {
      return;
    }
    return this.json.properties.pluginLocations && this.json.properties.pluginLocations.properties;
  }

}

module.exports = ExtensionSchema;
