describe('Menu Page', () => {
  const pageTitle = 'Adapt Version 5';

  it(`should have the title ${pageTitle}`, () => {
    cy.visit('/');
    cy.get('.menu__title-inner').should('contain', pageTitle);
  });
});
