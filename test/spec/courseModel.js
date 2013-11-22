define(['coreJS/adapt', 'coreModels/courseModel'], function(Adapt, CourseModel) {

    var dataLoaded = false;
    
    Adapt.on('data:loaded')
    
    Adapt.course = new CourseModel({url:"data/course.json"});
    
    console.log(Adapt);
    
    describe('Course model', function() {
    
        it('should fetch data', function() {
            
            expect(Adapt.course.get('title')).to.be("Adapt");
            
        });
        
        it('should trigger an event after the data is loaded', function() {
            
            expect(Adapt.course.get('title')).to.be("Adapt");
            
        });
    
    });

});