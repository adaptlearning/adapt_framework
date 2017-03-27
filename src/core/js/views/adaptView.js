define([
    'core/js/adapt'
], function(Adapt) {

    var AdaptView = Backbone.View.extend({

        attributes: function() {
            return {
                "data-adapt-id": this.model.get('_id')
            };
        },

        initialize: function() {
            this.listenTo(Adapt, 'remove', this.remove);
            this.listenTo(this.model, 'change:_isVisible', this.toggleVisibility);
            this.model.set('_globals', Adapt.course.get('_globals'));
            this.model.set('_isReady', false);
            this._isRemoved = false;
            this.preRender();
            this.render();
            this.setupOnScreenHandler();
        },

        preRender: function() {},

        postRender: function() {
            this.addChildren();
        },

        render: function() {
            Adapt.trigger(this.constructor.type + 'View:preRender', this);

            var data = this.model.toJSON();
            var template = Handlebars.templates[this.constructor.template];
            this.$el.html(template(data));

            _.defer(_.bind(function() {
                // don't call postRender after remove
                if(this._isRemoved) return;

                this.postRender();
                Adapt.trigger(this.constructor.type + 'View:postRender', this);
            }, this));

            return this;
        },

        setupOnScreenHandler: function() {
            var onscreen = this.model.get('_onScreen');

            if (!onscreen || !onscreen._isEnabled) return;

            this.$el.on('onscreen.adaptView', _.bind(function (e, m) {

                if (!m.onscreen) return;

                var minVerticalInview = onscreen._percentInviewVertical || 33;

                if (m.percentInviewVertical < minVerticalInview) return;

                this.$el.addClass( onscreen._classes || 'onscreen' ).off('onscreen.adaptView');

            }, this));
        },

        addChildren: function() {
            var nthChild = 0;
            var children = this.model.getChildren();
            var models = children.models;
            for (var i = 0, len = models.length; i < len; i++) {
                var model = models[i];
                if (model.get('_isAvailable')) {
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
                        $parentContainer.append(new ChildView({model:model}).$el);
                    } else {
                        throw 'The component \'' + models[i].attributes._id + '\'' +
                              ' (\'' + models[i].attributes._component + '\')' +
                              ' has not been installed, and so is not available in your project.';
                    }
                }
            }
        },

        setReadyStatus: function() {
            this.model.set('_isReady', true);
        },

        setCompletionStatus: function() {
            if (this.model.get('_isVisible')) {
                this.model.set('_isComplete', true);
                this.model.set('_isInteractionComplete', true);
            }
        },

        resetCompletionStatus: function(type) {
            if (!this.model.get("_canReset")) return;

            var descendantComponents = this.model.findDescendants('components');
            if (descendantComponents.length === 0) {
                this.model.reset(type);
            } else {
                descendantComponents.each(function(model) {
                    model.reset(type);
                });
            }
        },

        remove: function() {
            Adapt.trigger('plugin:beginWait');

            _.defer(_.bind(function() {
                this.$el.off('onscreen.adaptView');
                this._isRemoved = true;
                this.model.setOnChildren('_isReady', false);
                this.model.set('_isReady', false);
                this.$el.remove();
                this.stopListening();
                Adapt.trigger('plugin:endWait');
            }, this));

            return this;
        },

        setVisibility: function() {
            var visible = "visibility-hidden";
            if (this.model.get('_isVisible')) {
                visible = "";
            }
            return visible;
        },

        toggleVisibility: function() {
            if (this.model.get('_isVisible')) {
                return this.$el.removeClass('visibility-hidden');
            }
            this.$el.addClass('visibility-hidden');
        }

    });

    return AdaptView;

});
