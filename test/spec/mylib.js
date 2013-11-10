// load the entire module/library and pass to the test
define(['mylib'],function(mylib) {

  // use jasmine to run tests against the required code
  describe('mylib', function() {

    it('should be accessible', function() {
      expect(mylib).toNotBe(null);
    });

    it('should return a version', function() {
      expect(mylib.version).toNotBe(null);
    });

  });

});
