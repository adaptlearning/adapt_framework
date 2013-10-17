ADAPT.register('course', 'model', {
    initialize: function() {
        console.log('Course Model created');
        this.once('sync', function(){console.log(this)});
        this.fetch();
    },
    url: 'course/en/course.json'
});