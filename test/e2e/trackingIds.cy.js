describe('Tracking Ids', function () {

  beforeEach(function () {
    cy.getBuild();
  });

  it('should have specified tracking ids for all specified languages', function () {
    const {
      trackingIdType,
      availableLanguageNames
    } = this.build;
    availableLanguageNames.forEach(lang => {
      cy.getData(lang).then(data => {
        const trackingIdItems = data.filter(item => item._type === trackingIdType);
        trackingIdItems.forEach(item => {
          expect(item).to.have.ownProperty('_trackingId');
        });
      });
    });
  });

});
