import './helpers';

function getBuild() {
  try {
    return cy.fixture('adapt/js/build.min.js').then(build => {
      // Return for cy.getBuild().then(build => {});
      // Expose this.build in cypress
      return cy.wrap(build).as('build');
    });
  } catch {
    cy.task('log', 'fail');
  }
}

function getConfig() {
  return getBuild().then(build => {
    // Load the config.json
    return cy.fixture(`${build.coursedir}/config.json`).then(config => {
      // Return for cy.getConfig().then(config => {});
      // Expose this.config in cypress
      return cy.wrap(config).as('config');
    });
  });
}

function getData(languageCode = null) {
  try {
    // Setup data array
    const data = [];
    // Expose this.data in cypress
    cy.wrap(data).as('data');
    // Allow adapt-style shorthand properties:
    // this.data.course, this.data.contentObjects, this.data.articles, etc
    Object.defineProperties(data, {
      course: {
        get() {
          return data.find(item => item._type === 'course');
        },
        enumerable: false
      },
      contentObjects: {
        get() {
          return data.filter(item => ['menu', 'page'].includes(item._type));
        },
        enumerable: false
      },
      articles: {
        get() {
          return data.filter(item => item._type === 'article');
        },
        enumerable: false
      },
      blocks: {
        get() {
          return data.filter(item => item._type === 'block');
        },
        enumerable: false
      },
      components: {
        get() {
          return data.filter(item => item._type === 'component');
        },
        enumerable: false
      }
    });
    return getBuild().then(build => {
      const {
        coursedir,
        availableLanguageNames
      } = build;
      // Load the config.json
      return getConfig().then(config => {
        // Check that the specified language is available
        const defaultLanguage = config._defaultLanguage;
        languageCode = languageCode ?? defaultLanguage;
        if (!availableLanguageNames.includes(languageCode)) {
          throw new Error(`Language code is not available: ${languageCode}`);
        }
        // Load the language_data_manifest.js for the default or specified language
        cy.fixture(`${coursedir}/${languageCode}/language_data_manifest.js`).then(languageDataManifest => {
          // Load each of the files specified in the manifest
          languageDataManifest.forEach(localFilePath => {
            const filePath = `${coursedir}/${languageCode}/${localFilePath}`;
            cy.fixture(filePath).then(fileData => {
              // Add __index__ and __path__ attributes to each object as in adapt
              // so that each object's origin can be identified later if necessary
              if (Array.isArray(fileData)) {
                fileData.forEach((item, index) => {
                  item.__index__ = index;
                  item.__path__ = filePath;
                });
                data.push(...fileData);
                return;
              }
              fileData.__path__ = filePath;
              data.push(fileData);
            });
          });
        });
        // Return for cy.getData(languageCode).then(data => {});
        return cy.wrap(data);
      });
    });
  } catch {
    cy.task('log', 'fail');
  }
}

function testContainsOrNotExists(target, value) {
  if (value) {
    cy.get(target).should('contain', value);
  } else {
    cy.get(target).should('not.exist');
  }
}

Cypress.Commands.add('getBuild', getBuild);
Cypress.Commands.add('getConfig', getConfig);
Cypress.Commands.add('getData', getData);
Cypress.Commands.add('testContainsOrNotExists', testContainsOrNotExists);
