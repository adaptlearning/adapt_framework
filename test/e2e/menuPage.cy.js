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
    let counter = 0
    cy.get('.menu-item').should('have.length', Content.length)

    cy.get('.menu-item').each(($item) => {
      cy.get($item).within(() => {
        cy.get('.menu-item__title').should('contain', Content[counter].displayTitle)
        cy.get('.menu-item__body').should('contain', Content[counter].body)
        cy.get('button').should('contain', Content[counter].linkText)
        cy.get('.menu-item__duration').should('contain', Content[counter].duration)
        cy.get('img.menu-item__image').should('exist').should('have.attr', 'src', Content[counter]._graphic.src)
        counter += 1
      })
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
