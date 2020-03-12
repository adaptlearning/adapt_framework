const GlobalsSchema = require('./GlobalsSchema');

/**
 * Represents an article, block, accordion or other type of model schema
 */
class ModelSchema extends GlobalsSchema {

  /**
   * Create array of translatable attribute paths
   * @returns {[string]}
   */
  getTranslatablePaths() {
    const paths = {};
    this.traverse('', ({ description, next }, attributePath) => {
      switch (description.type) {
        case 'object':
          next(attributePath + description.name + '/');
          break;
        case 'array':
          if (!description.hasOwnProperty('items')) {
            // handles 'inputType': 'List' edge-case
            break;
          }
          if (description.items.type === 'object') {
            next(attributePath + description.name + '/');
          } else {
            next(attributePath);
          }
          break;
        case 'string':
          // check if attribute should be picked
          const value = Boolean(description.translatable);
          if (value === false) {
            break;
          }
          // add value to store
          paths[attributePath + description.name + '/'] = value;
          break;
      }
    }, '/');
    return Object.keys(paths);
  }

}

module.exports = ModelSchema;
