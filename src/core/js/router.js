/*
* Router
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Daryl Hedley
*/

define(["backbone", "coreJS/adapt", "coreViews/pageView"], function(Backbone, Adapt, PageView) {

    var Router = Backbone.Router.extend({
    
        initialize: function() {
            Adapt.once('app:dataReady', function() {
                document.title = Adapt.course.get('title');
            });
        },
        
        routes: {
            "":"handleCourse",
            "id/:id":"handleId"
        },
        
        handleCourse: function() {
            console.log('load course menu');
            this.removeViews();
        },
        
        handleId: function(id) {
            
            this.removeViews();
            this.showLoading();
            Adapt.currentLocation = id;
            
            var prefix = id.replace(/[0-9]/g, '');
            
            if (prefix === 'co-') {
                
                var currentModel = Adapt.contentObjects.findWhere({_id:id});
                
                if (currentModel.get('_type') == 'page') {
                    $('#wrapper').removeClass().addClass('location-content');
                    new PageView({model:currentModel});
                } else {
                    $('#wrapper').removeClass().addClass('location-menu');
                    console.log('new menu view');
                }
                
            } else {
                console.log('still needs a lot of work!!!')
                /*var currentObject = Adapt.articles.findWhere({id:id});
                var currentPage = currentObject.searchParent(‘page’);
                new PageView({model:currentPage});
                _.defer(function() {
                    $.scrollTo("#"+id);
                });*/
            }
            
        },
        
        removeViews: function() {
            Adapt.trigger('remove');
        },
        
        showLoading: function() {
            $('.loading').fadeIn('fast');
        }
    
    });
    
    return new Router;

});