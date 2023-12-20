const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:9001/',
    screenshotOnRunFailure: false,
    video: false,
    supportFile: '**/test/e2e/commands.js',
    specPattern: '**/test/e2e/**/*.cy.{js,jsx}',
    setupNodeEvents (on, config) {
      on('task', {
        log(message) {
          console.log(message);
          return null;
        }
      });
    }
  }
});
