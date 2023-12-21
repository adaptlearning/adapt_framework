describe('Languages', function () {

  beforeEach(function () {
    cy.getConfig().then(config => cy.getData(config._defaultLanguage));
  });

  it('should have the default language', function () {
    expect(this.build.availableLanguageNames).to.include(this.config._defaultLanguage);
  });

  it('should have data for all specified languages', function () {
    this.build.availableLanguageNames.forEach(lang => {
      cy.getData(lang);
    });
  });

});
