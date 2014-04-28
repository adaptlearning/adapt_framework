/*
* Router
* License - https://github.com/adaptlearning/adapt_framework/blob/master/LICENSE
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
            Adapt.mediator.defaultCallback('navigation:menu', function() {
                this.navigateToParent();
            }, this);
        },
        
        routes: {
            "":"handleCourse",
            "id/:id":"handleId"
        },
        
        handleCourse: function() {
            this.removeViews();
            Adapt.course.set('_isReady', false);
            this.setContentObjectToVisited(Adapt.course);
            Adapt.trigger('router:menu', Adapt.course);         
            Adapt.currentLocation = "course";
            $('#wrapper').removeClass().addClass('location-menu');
        },
        
        handleId: function(id) {
            
            this.removeViews();
            this.showLoading();
            Adapt.currentLocation = id;
                
            var currentModel = Adapt.contentObjects.findWhere({_id:id});
            this.setContentObjectToVisited(currentModel);
            if (currentModel.get('_type') == 'page') {
                Adapt.trigger('router:page', currentModel);
                $('#wrapper')
                    .removeClass()
                    .addClass('location-page')
                    .append(new PageView({model:currentModel}).$el);
            } else {
                Adapt.trigger('router:menu', currentModel);
                $('#wrapper').removeClass().addClass('location-menu');
            }
            
        },
        
        removeViews: function() {
            Adapt.trigger('remove');
        },
        
        showLoading: function() {
            $('.loading').show();
        },

        navigateToParent: function() {
            if (Adapt.currentLocation === 'course') {
                return;
            }
            var currentModel = Adapt.contentObjects.findWhere({_id:Adapt.currentLocation});
            var parent = currentModel.getParent();
            if (parent.get('_id') === Adapt.course.get('_id')) {
                return this.navigate('#', {trigger:true});
            }
            this.navigate('#/id/' + parent.get('_id'), {trigger:true});
        },

        setContentObjectToVisited: function(model) {
            model.set('_isVisited', true);
        }

    
    });
    
    return new Router;

});