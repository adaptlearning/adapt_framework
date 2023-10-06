import Course from '../../../src/course/en/course.json'

describe('Drawer', () => {
    const checkDrawerLength = (count) => {
        cy.get('.drawer__item').not('.u-display-none').should('have.length', count)
      }

    beforeEach(() => {
        cy.visit('/');
        cy.get('button[data-event="toggleDrawer"]').click()
    })

    it('should appear on the right hand side in menu view', () => {
        cy.get('.drawer').should('have.css', 'right').and('match', /0px/)
    });

    it('should appear on the right hand side in course view', () => {
        cy.get('button.drawer__close-btn').click()
        cy.get('button').contains('View').first().click()
        cy.get('button[data-event="toggleDrawer"]').click()
        cy.get('.drawer').should('have.css', 'right').and('match', /0px/)
    });

    it(`should show ${Course._resources._resourcesItems.length} items`, () => {
        checkDrawerLength(4)
    });

    it('should display the correct amount of items in each tab', () => {
        cy.get('button.is-selected[id="resources__show-all"]').should('exist')

        cy.get('button[id="resources__show-document"]').should('exist').click()
        checkDrawerLength(1)

        cy.get('button[id="resources__show-media"]').should('exist').click()
        checkDrawerLength(1)

        cy.get('button[id="resources__show-link"]').should('exist').click()
        checkDrawerLength(2)
    });

    it('ahouls display the correct drawer items', () => {
        cy.get('.drawer__item').each(($item, index) => {
            cy.get($item).within(() => {
                cy.get('.drawer__item-title').should('contain', Course._resources._resourcesItems[index].title)
                cy.get('.drawer__item-body').should('contain', Course._resources._resourcesItems[index].description)
                cy.get('a').should('have.attr', 'target', '_blank').should('have.attr', 'href', Course._resources._resourcesItems[index]._link)
            })
        })
    });

    it('should be able to close the drawer by clicking X', () => {
        cy.get('button.drawer__close-btn').click()
        
        cy.get('.drawer').should('have.attr', 'aria-expanded', 'false')
    });
    
    it('should be able to close the drawer by hitting ESC', () => {
        cy.get('.drawer').type('{esc}')

        cy.get('.drawer').should('have.attr', 'aria-expanded', 'false')
    });
  });
  