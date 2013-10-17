ADAPT.register('components', 'collection', {
    
    initialize: function() {
        console.log('Components collection created');
        this.fetch({reset:true});
    },
    
    url: 'course/en/components.json'
    
});