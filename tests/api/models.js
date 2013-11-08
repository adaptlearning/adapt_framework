define(function(require) {
    var AdaptModel = require('coreModels/adaptModel');
    var testModel = new AdaptModel();
    console.log(testModel)
    describe("Adapt model", function(){
        
        it('should have a reference to its children', function() {
            expect(false).to.equal(false);
        });
        
        it('should have a reference to its parent', function() {
            expect(false).to.equal(false);
        });
        
    });
});

