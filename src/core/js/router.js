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
            // Store #wrapper element to cache for later
            this.$wrapper = $('#wrapper');
            Adapt.on('router:updateLocation', this.updateLocation, this);
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
            this.showLoading();
            Adapt.course.set('_isReady', false);
            this.setContentObjectToVisited(Adapt.course);
            this.updateLocation({location:'course'});
            Adapt.trigger('router:menu', Adapt.course);
        },
        
        handleId: function(id) {
            
            this.removeViews();
            this.showLoading();
                
            var currentModel = Adapt.contentObjects.findWhere({_id:id});
            this.setContentObjectToVisited(currentModel);

            if (currentModel.get('_type') == 'page') {
                this.updateLocation({location:'page', id:id});
                Adapt.trigger('router:page', currentModel);
                this.$wrapper.append(new PageView({model:currentModel}).$el);
            } else {
                this.updateLocation({location:'menu', id:id});
                Adapt.trigger('router:menu', currentModel);
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
        },

        updateLocation: function(locationObject) {
            // Handles updating the location
            // Plugins can call this by triggering Adapt.trigger('router:updateLocation', location, id);
            Adapt.currentLocation = (locationObject.id) ? locationObject.id : locationObject.location;
            this.$wrapper
                .removeClass()
                .addClass('location-' + locationObject.location)
                .attr('data-location', locationObject.location);
        }

    
    });
    
    return new Router;

});