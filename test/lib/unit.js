const jest = require('jest');
const config = require('./../../jest.config');

const project = {
  projects: [__dirname]
};

module.exports = {
  start: async () => {
    await jest
      .runCLI(config, project.projects)
      .then((success) => {
        return success.results;
      })
      .catch((failure) => {
        console.error(failure);
      });
  }
};
