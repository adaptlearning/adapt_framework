ADAPT.register('blocks', 'collection', {
    
    initialize: function() {
        console.log('Blocks collection created');
        this.fetch({reset:true});
    },
    
    url: 'course/en/blocks.json'
    
});