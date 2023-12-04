const path = require('path');

/*
function flatten (arr) {
  try {
    const allData = arr.reduce((result, fileData) => {
      if (Array.isArray(fileData)) {
        result.push(...fileData);
      } else if (fileData instanceof Object) {
        result.push(fileData);
      }
      return result;
    }, []);
    cy.wrap(allData).as('allData');
  } catch {
    cy.task('log', 'Issue with flatten');
  }
}
*/

const loadManifestFiles = () => {
  try {
    const manifest = 'language_data_manifest.js';
    let allFileData = [];
    cy.fixture(manifest).as('manifest_data').then((data) => {
      data.forEach((item) => {
        const name = path.parse(item).name;
        cy.fixture(item).as(`${name}Data`).then((data) => {
          allFileData.push(data);
        });
      });
    }).then(() => {
      // Potentially flatten data as with FW data.js
      // flatten(allFileData);
    });
  } catch {
    cy.task('log', 'fail');
  }

};

function getData() {
  cy.wrap(loadManifestFiles());
}

Cypress.Commands.add('getData', getData);
