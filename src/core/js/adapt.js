define(['backbone'], function(Backbone) {
// Main ADAPT namespace
// --------------------
    var Adapt = {};
    
    Adapt.hub = _.extend({}, Backbone.Events);
    
    // Main Object containers
    // ----------------------
    var Views = [],
        Models = [],
        Collections = [],
        Routers = [],
        Extensions = [];
    
    // Create data collections
    // -----------------------
    // Enables to url to be changed based upon the default language
    // Collections handle their own fetch requests
    
    /*function loadCourse() {
        Data.course = ADAPT.create('course', 'model', {}, {url:'course/'+defaultLanguage+'/course.json'});
        Data.menuItems = ADAPT.create('menuItems', 'collection', {}, {url:'course/'+defaultLanguage+'/menuItems.json'});
        Data.articles = ADAPT.create('articles', 'collection', {}, {url:'course/'+defaultLanguage+'/articles.json'});
        Data.blocks = ADAPT.create('blocks', 'collection', {}, {url:'course/'+defaultLanguage+'/blocks.json'});
        Data.components = ADAPT.create('components', 'collection', {}, {url:'course/'+defaultLanguage+'/components.json'});
    }*/
    
    // Store registered views in Views array
    // -------------------------------------
    // Enables views to have this.hub to pass events and communicate with sandbox.
    // Enables views to extend exisiting views and also attach classProperties.
    
    function addView(name, extend, object, classProperties) {
        if (extend && Views[extend]) {
            var newView = Views[extend].extend(object, classProperties);
            Views[name] = newView;
            return;
        } else if (extend && !Views[extend]) 
            throw Error('Trying to extend a view that does not yet exist');
        if (Views[name]) 
            throw Error('Trying to overwrite view with out an extend argument');
        var newView = Backbone.View.extend(object, classProperties);
        Views[name] = newView;
    }
    
    // Store registered models in Models array
    // -------------------------------------
    // Enables models to have this.hub to pass events and communicate with sandbox.
    // Enables models to extend exisiting models and also attach classProperties.
    
    function addModel(name, extend, object, classProperties) {
        if (extend && Models[extend]) {
            var newModel = Models[extend].extend(object, classProperties);
            Models[name] = newModel;
            return;
        } else if (extend && !Models[extend]) 
            throw Error('Trying to extend a model that does not yet exist');
        if (Models[name]) 
            throw Error('Trying to overwrite model with out an extend argument');
        var newModel = Backbone.Model.extend(object, classProperties);
        Models[name] = newModel;
    }
    
    // Store registered collections in Collections array
    // -------------------------------------
    // Enables collections to have this.hub to pass events and communicate with sandbox.
    // Enables collections to extend exisiting collections and also attach classProperties.
    
    function addCollection(name, extend, object, classProperties) {
        if (extend && Collections[extend]) {
            var newCollection = Collections[extend].extend(object, classProperties);
            Collections[name] = newCollection;
            return;
        } else if (extend && !Collections[extend]) 
            throw Error('Trying to extend a collection that does not yet exist');
        if (Collections[name]) 
            throw Error('Trying to overwrite collection with out an extend argument');
        var newCollection = Backbone.Collection.extend(object, classProperties);
        Collections[name] = newCollection;
    }
    
    // Store registered routers in Routers array
    // -----------------------------------------
    // Enables router to have this.hub to pass events and communicate with sandbox.
    // Enables router to extend exisiting routers and also attach classProperties.
    
    function addRouter(name, extend, object, classProperties) {
        if (extend && Routers[extend]) {
            var newRouter = Routers[extend].extend(object, classProperties);
            Routers[name] = newRouter;
            return;
        } else if (extend && !Routers[extend]) 
            throw Error('Trying to extend a router that does not yet exist');
        if (Routers[name]) 
            throw Error('Trying to overwrite router with out an extend argument');
        var newRouter = Backbone.Router.extend(object, classProperties);
        Routers[name] = newRouter;
    }
    
    // Store registered extensions in Extensions array
    // -----------------------------------------------
    // Enables router to have this.hub to pass events and communicate with sandbox.
    // Extensions get called as soon as they are registered
    
    function addExtension(name, extend, object) {
        if (extend && Extensions[extend]) {
            var newExtension = _.extend(object, Extensions[extend]);
            Extensions[name] = newExtension;
            Extensions[name].call(Extensions[name]);
            return;
        } else if (extend && !Extensions[extend]) 
            throw Error('Trying to extend a extension that does not yet exist');
        if (Extensions[name]) 
            throw Error('Trying to overwrite extension with out an extend argument');
        Extensions[name] = object;
        Extensions[name].call(Extensions[name]);
    }
    
    // Register any type of model, view, collection, router and extension
    // ------------------------------------------------------------------
    // Checks to see if the API is used in the correct way.
    // Multiple arguments can be used but three is the minimum.
    
    Adapt.register = function(name, type, extend, object, classProperties) {
        
        var errorMessage = "Please check your register arguments";
        var argsLength = arguments.length;
        
        // Check if five arguments are passed
        if (argsLength === 5) {
            if (!_.isString(name) || 
                !_.isString(type) || 
                !_.isString(extend) || 
                !_.isObject(object) || 
                !_.isObject(classProperties)) throw Error(errorMessage);
        }
        
        // Check if four arguments are passed
        if (argsLength === 4) {
            // Check if arguments doesn't contain extend
            if (!_.isString(extend)) {
                classProperties = object;
                object = extend;
                
                // Would mean (name, type, object, classProperties)
                if (!_.isString(name) ||
                    !_.isString(type) ||
                    !_.isObject(object) ||
                    !_.isObject(classProperties)) throw Error(errorMessage);
                extend = undefined;
            } else {
                // Would mean (name, type, extend, object)
                if (!_.isString(name) ||
                    !_.isString(type) ||
                    !_.isString(extend) ||
                    !_.isObject(object)) throw Error(errorMessage);
                classProperties = undefined;
            }
        }
        
        // Check if three arguments are passed
        if (argsLength === 3) {
            object = extend
            // Would mean (name, type, object)
            if (!_.isString(name) ||
                !_.isString(type) ||
                !_.isObject(object)) throw Error(errorMessage);
            extend = classProperties = undefined;
        }
                
        if (type === 'view') addView(name, extend, object, classProperties);
        
        if (type === 'model') addModel(name, extend, object, classProperties);
        
        if (type === 'collection') addCollection(name, extend, object, classProperties);
        
        if (type === 'router') addRouter(name, extend, object, classProperties);
        
        if (type === 'extension') addExtension(name, extend, object);
        
    }
    
    // Create any type of model, view, collection, router and extension
    // ------------------------------------------------------------------
    // Checks to see if the object is registered
    // Returns a new object with data and options arguments set on the object
    
    Adapt.create = function(name, type, data, options) {
        
        if (type === 'view') {            
            if (Views[name] === undefined) 
                throw Error('This view is undefined, please register a view before creating');
            options = data;
            data = undefined;
            return new Views[name](options);
        }
        
        if (type === 'model') {
            if (Models[name] === undefined) 
                throw Error('This model is undefined, please register a model before creating');
            return new Models[name](data, options);
        }
        
        if (type === 'collection') {
            if (Collections[name] === undefined)
                throw Error('This collection is undefined, please register a collection before creating');
            return new Collections[name](data, options);
        }
        
        if (type === 'router') {
            if (Routers[name] === undefined)
                throw Error('This router is undfined, please register a router before creating');
            options = data;
            data = undefined;
            return new Routers[name](options);
        }
    }
    
    // Adapt init
    // ----------
    // Called when Adapt is ready to load course
    // All extensions, components, themes and menus are loaded
    // Passkey is triggered through 'ready:adapt' event
    
    Adapt.initialize = _.once(function() {
        Adapt.hub.trigger('ready:adapt');
    });
    
    return Adapt
    
});