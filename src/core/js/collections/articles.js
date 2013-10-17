ADAPT.register('articles', 'collection', {
    
    initialize: function() {
        console.log('Articles collection created');
        this.fetch({reset:true});
    },
    
    url: 'course/en/articles.json'
    
});