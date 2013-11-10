// load the entire module/library and pass to the test
define(['/src/core/js/adapt.js'],function(Adapt) {

  // use jasmine to run tests against the required code
  describe('Adapt', function() {

    it('should be faking a test of true', function() {
      expect(true).toBe(true);
    });

  });

});
