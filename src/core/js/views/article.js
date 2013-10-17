define("mcqComponent", ['adapt'], function(Adapt){
    
Adapt.register('mcq', 'view', 'question', {
    initialize:function() {
    
    }
});
    
}]);


ADAPT.register('article', 'view', {
    initialize: function() {
        console.log('Article View created')
    }
});


//ADAPT.Require('article', 'view', {model: ADAPT.Require('article', 'model')});