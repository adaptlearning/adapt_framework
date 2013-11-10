// load the entire module/library and pass to the test
define(['mylib'],function(mylib) {

  // use jasmine to run tests against the required code
  describe('module', function() {

    it('should have a method', function() {
      expect(mylib.method).toNotBe(undefined);
    });

    it('the method should work', function() {
      expect(mylib.method()).toBe('Custom method');
    });

  });

});
