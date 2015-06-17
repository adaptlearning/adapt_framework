/*
* Router
* License - https://github.com/adaptlearning/adapt_framework/blob/master/LICENSE
* Maintainers - Daryl Hedley
*/

define(function(require) {

    var Backbone = require('backbone');
    var Adapt = require('coreJS/adapt');
    var RouterModel = require('coreModels/routerModel');
    var PageView = require('coreViews/pageView');

    Adapt.router = new RouterModel(null, {reset: true});

    var Router = Backbone.Router.extend({
    
        initialize: function() {
            this.showLoading();
            // Store #wrapper element to cache for later
            this.$wrapper = $('#wrapper');
            Adapt.once('app:dataReady', function() {
                document.title = Adapt.course.get('title');
            });
            this.listenTo(Adapt, 'navigation:backButton', this.navigateToPreviousRoute);
        },
        
        routes: {
            "":"handleCourse",
            "id/:id":"handleId",
            ":pluginName(/*location)(/*action)": "handlePluginRouter"
        },

        handlePluginRouter: function(pluginName, location, action) {
            var pluginLocation = pluginName;
            if (location) {
                pluginLocation = pluginLocation + '-' +location;
                if (action) {
                    pluginLocation = pluginLocation + '-' + action;
                }
            }
            this.updateLocation(pluginLocation);
            Adapt.trigger('router:plugin:' + pluginName, pluginName, location, action);
            Adapt.trigger('router:plugin', pluginName, location, action);
        },
        
        handleCourse: function() {
            this.removeViews();
            this.showLoading();
            Adapt.course.set('_isReady', false);
            this.setContentObjectToVisited(Adapt.course);
            this.updateLocation('course');
            Adapt.trigger('router:menu', Adapt.course);
        },
        
        handleId: function(id) {
            
            var currentModel = Adapt.findById(id);

            switch (currentModel.get('_type')) {
                case 'page': case 'menu':
                    this.removeViews();
                    this.showLoading();
                    
                    this.setContentObjectToVisited(currentModel);

                    if (currentModel.get('_type') == 'page') {
                        var location = 'page-' + id; 
                        this.updateLocation(location, 'page', id);
                        Adapt.trigger('router:page', currentModel);
                        this.$wrapper.append(new PageView({model:currentModel}).$el);
                    } else {
                        var location = 'menu-' + id; 
                        this.updateLocation(location, 'menu', id);
                        Adapt.trigger('router:menu', currentModel);
                    }
                break;
                default:
                    Adapt.navigateToElement('.' + id);
            }
        },
        
        removeViews: function() {
            Adapt.trigger('remove');
        },
        
        showLoading: function() {
            $('.loading').show();
        },

        navigateToPreviousRoute: function() {
            // Sometimes a plugin might want to stop the default navigation
            // Check whether default navigation has changed
            if (Adapt.router.get('_canNavigate')) {
                if (!Adapt.location._currentId) {
                    return Backbone.history.history.back();
                }
                if (Adapt.location._previousContentType === "page" && Adapt.location._contentType === "menu") {
                    return this.navigateToParent();
                }
                if (Adapt.location._previousContentType === "page") {
                    return Backbone.history.history.back();
                }
                if (Adapt.location._currentLocation === 'course') {
                    return;
                }
                this.navigateToParent();
            }
        },

        navigateToParent: function() {
            var parentId = Adapt.contentObjects.findWhere({_id:Adapt.location._currentId}).get("_parentId");
            var route = (parentId === Adapt.course.get("_id")) ? "#/" : "#/id/" + parentId;
            this.navigate(route, { trigger: true });
        },

        setContentObjectToVisited: function(model) {
            model.set('_isVisited', true);
        },

        updateLocation: function(currentLocation, type, id) {
            // Handles updating the location
            Adapt.location._previousId = Adapt.location._currentId;
            Adapt.location._previousContentType = Adapt.location._contentType;

            if (currentLocation === 'course') {
                Adapt.location._currentId = Adapt.course.get('_id');
                Adapt.location._contentType = 'menu';
                Adapt.location._lastVisitedMenu = currentLocation;
            } else if (!type) {
                Adapt.location._currentId = null;
                Adapt.location._contentType = null;

            } else if (arguments.length === 3) {
                Adapt.location._currentId = id;
                Adapt.location._contentType = type;
                if (type === 'menu') {
                    Adapt.location._lastVisitedType = 'menu';
                    Adapt.location._lastVisitedMenu = id;
                } else if (type === 'page') {
                    Adapt.location._lastVisitedType = 'page';
                    Adapt.location._lastVisitedPage = id;
                }
            }

            Adapt.location._currentLocation = currentLocation;

            var classes = (Adapt.location._currentId) ? 'location-' 
                    + Adapt.location._contentType 
                    + ' location-id-' 
                    + Adapt.location._currentId :
                    'location-' + Adapt.location._currentLocation;
            this.$wrapper
                .removeClass()
                .addClass(classes)
                .attr('data-location', Adapt.location._currentLocation);

            this.setDocumentTitle();

            // Trigger event when location changes
            Adapt.trigger('router:location', Adapt.location);
        },

        setDocumentTitle: function() {
            if (!Adapt.location._currentId) return;


            var currentModel = Adapt.findById(Adapt.location._currentId);

            var pageTitle = "";
            if (currentModel && currentModel.get("_type") !== "course") {
                var displayTitle = currentModel.get("title");
                if (displayTitle) {
                    pageTitle = " | " + displayTitle;
                }
            }

            var courseTitle = Adapt.course.get("title");
            var documentTitle = courseTitle + pageTitle;
            
            Adapt.once("pageView:ready menuView:ready", function() {
                document.title = documentTitle;
            });

        }

    
    });
    
    return new Router({model: new Backbone.Model()});

});
