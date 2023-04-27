const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:9001/',
    screenshotOnRunFailure: false,
    video: false
  }
});
