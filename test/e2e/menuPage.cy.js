import Content from '../../src/course/en/contentObjects.json'
import Course from '../../src/course/en/course.json'

describe('Menu Page', () => {
  beforeEach(() => {
    cy.visit('/');
  })

  it(`should have the title '${Course.displayTitle}' and correct description`, () => {
    cy.get('.menu__title-inner').should('contain', Course.displayTitle);
    cy.get('.menu__body-inner').should('contain', Course.body);
  });

  it(`should display ${Content.length} menu tiles`, () => {
    cy.get('.menu-item').should('have.length', Content.length)
    cy.get('.menu-item').first().within(() => {
      cy.get('.menu-item__title').should('contain', Content[0].displayTitle)
      cy.get('.menu-item__body').should('contain', Content[0].body)
      cy.get('button').should('contain', Content[0].linkText)
      cy.get('.menu-item__duration').should('contain', Content[0].duration)
      cy.get('.menu-item__subtitle').should('not.exist')
    })
    cy.get('.menu-item').eq(1).within(() => {
      cy.get('.menu-item__title').should('contain', Content[1].displayTitle)
      cy.get('.menu-item__body').should('contain', Content[1].body)
      cy.get('button').should('contain', Content[1].linkText)
      cy.get('.menu-item__duration').should('contain', Content[1].duration)
    })
    cy.get('.menu-item').eq(2).within(() => {
      cy.get('.menu-item__title').should('contain', Content[2].displayTitle)
      cy.get('.menu-item__body').should('contain', Content[2].body)
      cy.get('button').should('contain', Content[2].linkText)
      cy.get('.menu-item__duration').should('contain', Content[2].duration)
    })
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
