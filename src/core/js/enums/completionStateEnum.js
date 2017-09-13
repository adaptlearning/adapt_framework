define(function() {
  
      var COMPLETION_STATE = ENUM([
          'COMPLETE',
          'INCOMPLETE',
          'PASS',
          'FAIL'
      ]);
  
      return COMPLETION_STATE;
  
  })