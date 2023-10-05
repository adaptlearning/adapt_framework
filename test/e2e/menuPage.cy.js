describe('Menu Page', () => {
  const pageTitle = 'Adapt Version 5';
  const Content = [
    {
      "_id": "co-05",
      "_parentId": "course",
      "_type": "page",
      "_classes": "",
      "_htmlClasses": "",
      "title": "Presentation Components",
      "displayTitle": "Presentation Components",
      "body": "Find out what presentation components are available within the core bundle and how you might consider using them within your courses.",
      "pageBody": "",
      "instruction": "Scroll down to see what presentation components are available as part of the v5 core bundle.",
      "linkText": "View",
      "duration": "2 mins"
    },
    {
      "_id": "co-10",
      "_parentId": "course",
      "_type": "page",
      "_classes": "",
      "_htmlClasses": "",
      "title": "Question Components",
      "displayTitle": "Question Components",
      "body": "Discover what question components are available within the framework, along with some tips on how to use them.",
      "pageBody": "Without a range of question components, we can’t easily measure if learners are meeting the intended course objectives, provide guidance and feedback if they’re not, or give them opportunities to practise in a ‘safe environment’.<br><br>Discover what question components are available within the framework, along with some tips on how to use them.",
      "instruction": "Scroll down to see what question components are available as part of the v5 core bundle.",
      "linkText": "View",
      "duration": "2 mins"
    },
    {
      "_id": "co-15",
      "_parentId": "course",
      "_type": "page",
      "_classes": "assessment",
      "_htmlClasses": "",
      "title": "Adapt Assessment",
      "displayTitle": "Adapt Assessment",
      "body": "Find out more about the assessment functionality introduced in Adapt v2, including randomised banks and an improved results feature.",
      "pageBody": "We’ve put together a very short quiz to demonstrate the new assessment functionality. In this simple example there are two banks that each contain three questions with two being taken from each bank at random. The order in which the questions are presented is then also randomised, as is the order of each question’s options.",
      "instruction": "Think you can get a perfect score? Scroll down to attempt the first question.",
      "linkText": "View",
      "duration": "2 mins"
    }
]


  beforeEach(() => {
    cy.visit('/');
  })

  it(`should have the title ${pageTitle}`, () => {
    cy.get('.menu__title-inner').should('contain', pageTitle);
  });

  it('should display the correct amount of menu tiles', () => {
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
