import Content from '../../../src/course/en/contentObjects.json'
import Course from '../../../src/course/en/course.json'

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

    cy.get('.menu-item').each(($item, index) => {
      cy.get($item).within(() => {
        cy.get('.menu-item__title').should('contain', Content[index].displayTitle)
        cy.get('.menu-item__body').should('contain', Content[index].body)
        cy.get('button').should('contain', Content[index].linkText)
        cy.get('.menu-item__duration').should('contain', Content[index].duration)
        cy.get('img.menu-item__image').should('exist').should('have.attr', 'src', Content[index]._graphic.src)
      })
    })
  })
});
