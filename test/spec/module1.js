// load the entire module/library and pass to the test
define(['mylib'],function(mylib) {

  // use jasmine to run tests against the required code
  describe('feature', function() {

    it('should be working ;)', function() {
      expect(mylib.feature).toBe('Custom feature');
    });

  });

});
