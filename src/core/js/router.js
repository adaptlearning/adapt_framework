/*
* Router
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Daryl Hedley
*/

define(function(require) {

    var Backbone = require('backbone');
    var Adapt = require('coreJS/adapt');
    var PageView = require('coreViews/pageView');

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
            this.removeViews();
            Adapt.trigger('router:handleCourse', Adapt.course);
            console.log('load course menu');
            
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