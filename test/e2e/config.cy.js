describe('Config', function () {

  beforeEach(function () {
    cy.getConfig();
  });

  it('should have a valid direction', function () {
    expect(this.config._defaultDirection).to.be.oneOf(['ltr', 'rtl']);
  });

});
