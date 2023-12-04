import {getData} from './commands'

describe('Menu Page', () => {

  beforeEach(() => {
    cy.getData()
  })

  it(`should have the correct title`, function () {
    cy.visit('/');
    cy.get('.menu__title-inner').should('contain', this.courseData.displayTitle);
  });
});
