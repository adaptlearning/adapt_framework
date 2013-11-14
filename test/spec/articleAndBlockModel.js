/*define([
    "coreModels/articleModel",
    "coreModels/blockModel",
    "coreModels/componentModel",
    "coreJS/adaptCollection", 
    "coreJS/adapt"
], function(ArticleModel, BlockModel, ComponentModel, AdaptCollection, Adapt) {

    describe('Adapt Model', function() {
        
        console.log(AdaptCollection);
        console.log(Adapt)
        
        function checkDataIsLoaded() {
            if (Adapt.articles.models.length > 0 
                && Adapt.blocks.models.length > 0 
                && Adapt.components.models.length > 0) {
                var firstModel = Adapt.blocks.models[0];
                console.log(firstModel);
                firstModel.set('_ready', true);
            }
        }
        
        Adapt.on('adaptCollection:dataLoaded', checkDataIsLoaded);
        Adapt.articles = new AdaptCollection(null, {model: ArticleModel, url:"../src/course/en/articles.json"});
        Adapt.blocks = new AdaptCollection(null, {model: BlockModel, url:"../src/course/en/blocks.json"});
        Adapt.components = new AdaptCollection(null, {model: ComponentModel, url:"../src/course/en/components.json"});
        //console.log(TestAdaptModel.checkReadyStatus());
    
        var firstModel = Adapt.articles.models[0];
        console.log(firstModel);
        it('should check ready status', function() {
        
            expect(true).to.be(true);
        
        });
    
    });

});*/