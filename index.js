const fs = require('fs/promises');
const path = require('path');

(async function getSchema() {
  const files = await fs.readdir('src/core/schema');
  const jsonFiles = files.filter(file => path.extname(file) === '.json');
  const schema = Object.fromEntries(jsonFiles.map(schema => [
    path.basename(schema, '.schema.json'),
    require(`./src/core/schema/${schema}`)
  ]));

  module.exports = { schema };
})();
