define([
    "core/js/adapt",
    './adaptView',
    './diffView'
], function(Adapt, AdaptView, DiffView) {

    //Abstract view - Do not instanciate directly, please extend first

    var AdaptDiffView = DiffView.extend({

        // Default view properties
        hasChildren: false,
        childViews: undefined,
        areChildrenReady: false,
        
        initialize: function initialize(options) {

            // Stop the view from proceeding until it has a type assigned
            // Should be "page", "menu", "article", block", "component", etc
            if (!this.constructor.type) throw "No 'type' on view defintion";

            // Create an array to hold child views
            if (this.hasChildren) this.childViews = [];

            if (options.parentView && options.parentView.addChildView) {
                options.parentView.addChildView(this);
            }

            DiffView.prototype.initialize.apply(this, arguments);

        },

        initializeEventListeners: function initializeEventListeners() {

            this.listenToOnce(this, {

                "preRender": function() {

                    // Trigger expected Adapt event
                    Adapt.trigger(this.constructor.type + 'View:preRender', this);

                },

                "postRender": function() {

                    // Trigger expected Adapt event
                    Adapt.trigger(this.constructor.type + 'View:postRender', this);

                    if (this.hasChildren) this.addChildren();
                }

            });

            // Handle classic Adapt model visibility
            this.listenTo(this.model, 'change:_isVisible', this.toggleVisibility);
            
            DiffView.prototype.initializeEventListeners.apply(this, arguments);
        },

        addChildren: function addChildren() {

            if (!this.constructor.childContainer) return;

            var nthChild = 0;
            var availableChildrenModels = this.model.getChildren().where({_isAvailable: true});

            for (var i = 0, len = availableChildrenModels.length; i < len; i++) {
                var model = availableChildrenModels[i];
                nthChild ++;

                var ChildView;
                var ViewModelObject = this.constructor.childView || Adapt.componentStore[model.get("_component")];

                //use view+model object
                if (ViewModelObject.view) ChildView = ViewModelObject.view;
                //use view only object
                else ChildView = ViewModelObject;

                if (ChildView) {

                    var $parentContainer = this.$(this.constructor.childContainer);

                    model.set("_nthChild", nthChild);

                    var childView = new ChildView({
                        model:model, 
                        parentView: this
                    });

                    $parentContainer.append(childView.$el);

                } else {
                    throw 'The component \'' + models[i].attributes._id + '\'' +
                          ' (\'' + models[i].attributes._component + '\')' +
                          ' has not been installed, and so is not available in your project.';
                }
            }
        },

        // Override setReadyStatus to handle children
        setReadyStatus: function() {
            this.isReady = true;
            this.checkReadyStatus();
        },

        //Check the status of the children views before triggering "ready"
        checkReadyStatus: function checkReadyStatus() {
            if (!this.isReady) return;

            var hasChildViews = (this.hasChildren && this.childViews.length);
            if (hasChildViews) {

                // If the children have already been set to ready then return
                if (this.areChildrenReady) return;

                var notReadyChildren = _.filter(this.childViews, function(childView) {
                    if (!childView.isReady) return true;
                    return false;
                });

                // If some children are not ready then return
                if (!notReadyChildren.length) return;

                this.areChildrenReady = true;
            }

            _.defer(_.bind(function() {
                if (this.model && this.model.set) {
                    this.model.set("_isReady", true);
                }
                this.trigger("ready");
            }, this));

        },

        addChildView: function(view) {
            if (!this.hasChildren) {
                throw "hasChildren is set to false for this view";
            }

            // Check that the child view hasn't been registered already
            for (var i = 0, l = this.childViews.length; i < l; i++) {
                var childView = this.childViews[i];
                if (childView.cid === view.cid) return;
            }

            // Register the child view
            this.childViews.push(view);

            // Setup event listeners for the childView
            this.listenToOnce(view, {
                "ready": this.onChildViewReady,
                "detach": this.onChildViewDetach
            }, this);
        },

        onChildViewReady: function(view) {
            this.checkReadyStatus();
        },

        onChildViewDetach: function(view) {
            for (var i = 0, l = this.childViews.length; i < l; i++) {
                var childView = this.childViews[i];
                if (childView.cid === view.cid) {
                    this.childViews.splice(i,1);
                    return;
                }
            }
        },

        //Import standard AdaptView functions
        setCompletionStatus: AdaptView.prototype.setCompletionStatus,

        resetCompletionStatus: AdaptView.prototype.resetCompletionStatus,

        setVisibility: AdaptView.prototype.setVisibility,

        toggleVisibility:AdaptView.prototype.toggleVisibility

    });

    return AdaptDiffView;

});
