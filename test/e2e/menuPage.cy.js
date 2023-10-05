describe('Menu Page', () => {
  const pageTitle = 'Adapt Version 5';

  beforeEach(() => {
    cy.visit('/');
  })

  it(`should have the title ${pageTitle}`, () => {
    cy.visit('/');
    cy.get('.menu__title-inner').should('contain', pageTitle);
  });

  it('should display the correct amount of menu tiles', () => {
    cy.get('.menu-item').should('have.length', 3)
    cy.get('.menu-item').first().should('contain', 'Presentation Components')
    cy.get('.menu-item').eq(1).should('contain', 'Question Components')
    cy.get('.menu-item').eq(2).should('contain', 'Adapt Assessment')
  })

  it('should have an expandable drawer', () => {
    cy.get('.drawer[aria-expanded="true"]').should('not.exist')
    cy.get('.drawer[aria-expanded="false"]').should('exist')

    cy.get('button[data-event="toggleDrawer"]').click()

    cy.get('.drawer[aria-expanded="true"]').should('exist')
    cy.get('.drawer[aria-expanded="false"]').should('not.exist')

    cy.get('button.drawer__close-btn').click()

    cy.get('.drawer[aria-expanded="true"]').should('not.exist')
    cy.get('.drawer[aria-expanded="false"]').should('exist')
  })
});
