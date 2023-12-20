const loadManifestFiles = () => {
  try {
    // Setup data array
    const data = [];
    // Expose this.data in cypress
    cy.wrap(data).as('data');
    // Allow adapt-style shorthand properties:
    // this.data.config, this.data.course, this.data.articles, etc
    Object.defineProperties(data, {
      config: {
        get() {
          return data.find(item => item._type === 'config');
        },
        enumerable: false
      },
      course: {
        get() {
          return data.find(item => item._type === 'course');
        },
        enumerable: false
      },
      contentObjects: {
        get() {
          return data.filter(item => ['menu','page'].includes(item._type));
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
    // Load the config.json
    cy
      .fixture('course/config.json')
      .then(configData => {
        // Assign _type = 'config' to the config object
        configData._type = 'config';
        data.push(configData);
        // Fetch the default language
        const defaultLanguage = configData._defaultLanguage;
        // Load the language_data_manifest.js for the default language
        cy
          .fixture(`course/${defaultLanguage}/language_data_manifest.js`)
          .then(languageDataManifest => {
            // Load each of the files specified in the manifest
            languageDataManifest.forEach(localFilePath => {
              const filePath = `course/${defaultLanguage}/${localFilePath}`
              cy
                .fixture(filePath)
                .then(fileData => {
                  // Add __index__ and __path__ attributes to each object as in adapt
                  // so that each object's origin can be identified later if necessary
                  if (Array.isArray(fileData)) {
                    fileData.forEach((item, index) => {
                      item.__index__ = index;
                      item.__path__ = filePath;
                      data.push(item);
                    });
                    return data.push(...fileData);
                  }
                  fileData.__path__ = filePath;
                  data.push(fileData);
                });
            });
          })
        });
  } catch {
    cy.task('log', 'fail');
  }

};

function getData() {
  loadManifestFiles();
}

Cypress.Commands.add('getData', getData);
