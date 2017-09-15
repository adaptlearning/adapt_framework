define(function() {
  
      var COMPLETION_STATE = ENUM([
          'INCOMPLETE',
          'COMPLETED',
          'PASSED',
          'FAILED'
      ]);
  
      return COMPLETION_STATE;
  
  })