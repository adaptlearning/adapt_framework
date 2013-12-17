/*
* Router
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Daryl Hedley
*/

define(["backbone", "coreJS/adapt", "coreViews/pageView"], function(Backbone, Adapt, PageView) {

    var Router = Backbone.Router.extend({
    
        initialize: function() {
            this.showLoading();
            Adapt.once('app:dataReady', function() {
                document.title = Adapt.course.get('title');
            });
        },
        
        routes: {
            "":"handleCourse",
            "id/:id":"handleId"
        },
        
        handleCourse: function() {
            Adapt.trigger('router:handleCourse');
            console.log('load course menu');
            this.removeViews();
            Adapt.currentLocation = "course";
        },
        
        handleId: function(id) {
            
            Adapt.trigger('router:handleId', id);
            this.removeViews();
            this.showLoading();
            Adapt.currentLocation = id;
                
            var currentModel = Adapt.contentObjects.findWhere({_id:id});
            
            if (currentModel.get('_type') == 'page') {
                Adapt.trigger('router:page', id);
                $('#wrapper')
                    .removeClass()
                    .addClass('location-page')
                    .append(new PageView({model:currentModel}).$el);
            } else {
                Adapt.trigger('router:menu', id);
                $('#wrapper').removeClass().addClass('location-menu');
                console.log('new menu view');
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